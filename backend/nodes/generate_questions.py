"""
generate_questions.py
---------------------
Generates MCQ questions using the LLM (OpenAI-compatible API — Groq / xAI).

Works for BOTH modes:
  - Random Mode: uses subject, topic, difficulty, number_of_questions
  - Notes Mode:  uses notes_text, summary, difficulty, number_of_questions
                 Questions are strictly grounded to the supplied notes.

Uses the openai SDK directly — no langchain-openai dependency.
"""

import json
import os
from typing import Any

from openai import OpenAI


# --------------------------------------------------------------------------- #
# OpenAI-compatible client (works with Groq, xAI, or any OpenAI-compatible)  #
# --------------------------------------------------------------------------- #
def _get_client() -> OpenAI:
    return OpenAI(
        api_key=os.environ["XAI_API_KEY"],
        base_url=os.environ["XAI_BASE_URL"],
    )


# --------------------------------------------------------------------------- #
# System prompts                                                               #
# --------------------------------------------------------------------------- #
RANDOM_SYSTEM_PROMPT = """You are an expert quiz generator for college-level students.

Generate multiple-choice questions (MCQs) on the given subject and topic.

RULES:
- Each question must have exactly 4 options (do NOT include letter prefixes like A/B/C/D).
- Exactly one option must be correct.
- Questions must match the specified difficulty level.
- Avoid trick questions or ambiguous wording.
- The explanation should be concise and educational.

You MUST respond with valid JSON as a list in exactly this format:
[
  {
    "question": "What is the primary purpose of normalization?",
    "options": ["Reduce data redundancy", "Increase duplicate data", "Remove all tables", "Increase storage requirements"],
    "correct_answer": "Reduce data redundancy",
    "explanation": "Normalization reduces redundancy and improves data organization in a database."
  }
]

Return ONLY the JSON array. No text before or after. No markdown fences."""


NOTES_SYSTEM_PROMPT = """You are an expert quiz generator for college-level students.

STRICT RULES — CRITICAL:
- Generate questions ONLY from the supplied notes.
- Every question MUST be answerable using information explicitly contained in the notes.
- Do NOT introduce outside facts, definitions, or concepts not present in the notes.
- Do NOT use your own training knowledge to fill gaps.
- If the notes do not contain enough information to generate the requested number of questions, generate only the number you can reliably create from the notes.

Each question must have exactly 4 options (do NOT include letter prefixes like A/B/C/D).
Exactly one option must be correct.
Questions must match the specified difficulty level.

You MUST respond with valid JSON as a list in exactly this format:
[
  {
    "question": "Question text here?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correct_answer": "Option 1",
    "explanation": "Brief explanation referencing the notes."
  }
]

Return ONLY the JSON array. No text before or after. No markdown fences."""


# --------------------------------------------------------------------------- #
# Validation helper                                                            #
# --------------------------------------------------------------------------- #
def _validate_questions(questions: list) -> list[str]:
    """Return a list of validation errors. Empty list means valid."""
    errors = []
    if not isinstance(questions, list) or len(questions) == 0:
        errors.append("Questions must be a non-empty list.")
        return errors

    for i, q in enumerate(questions):
        if not isinstance(q, dict):
            errors.append(f"Question {i+1} is not a dict.")
            continue
        if not q.get("question"):
            errors.append(f"Question {i+1} missing 'question' field.")
        options = q.get("options", [])
        if not isinstance(options, list) or len(options) != 4:
            errors.append(f"Question {i+1} must have exactly 4 options.")
        if not q.get("correct_answer"):
            errors.append(f"Question {i+1} missing 'correct_answer' field.")
        elif q.get("correct_answer") not in options:
            errors.append(f"Question {i+1} correct_answer not in options list.")
        if not q.get("explanation"):
            errors.append(f"Question {i+1} missing 'explanation' field.")

    return errors


# --------------------------------------------------------------------------- #
# Main node function                                                           #
# --------------------------------------------------------------------------- #
def generate_questions(state: dict[str, Any]) -> dict[str, Any]:
    """
    Generate MCQ questions based on the current mode.
    Stores results in state["questions"].
    """
    mode = state.get("mode", "random")
    difficulty = state.get("difficulty", "Medium")
    number_of_questions = state.get("number_of_questions", 5)

    client = _get_client()
    model = os.environ["XAI_MODEL"]

    # --- Build the user prompt based on mode ---
    if mode == "random":
        subject = state.get("subject", "General Knowledge")
        topic = state.get("topic", "General")

        system_prompt = RANDOM_SYSTEM_PROMPT
        user_prompt = (
            f"Generate exactly {number_of_questions} MCQ questions.\n\n"
            f"Subject: {subject}\n"
            f"Topic: {topic}\n"
            f"Difficulty: {difficulty}\n\n"
            f"Remember: return only a valid JSON array of {number_of_questions} question objects."
        )

    else:  # notes mode
        notes_text = state.get("notes_text", "")
        summary = state.get("summary", "")

        if not notes_text:
            return {**state, "error": "No notes text available to generate questions from."}

        # Truncate to avoid token limits
        if len(notes_text) > 10000:
            notes_text = notes_text[:10000] + "\n\n[Note: content truncated]"

        system_prompt = NOTES_SYSTEM_PROMPT
        user_prompt = (
            f"Generate up to {number_of_questions} MCQ questions strictly from the notes below.\n\n"
            f"Difficulty: {difficulty}\n\n"
            f"=== NOTES SUMMARY ===\n{summary}\n\n"
            f"=== FULL NOTES ===\n{notes_text}\n\n"
            f"Remember: Only generate questions answerable from the notes above. "
            f"Return only a valid JSON array."
        )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    # --- Call LLM with one retry ---
    last_error = ""
    for attempt in range(2):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
            )
            raw = response.choices[0].message.content.strip()

            # Strip markdown code fences if present
            if raw.startswith("```"):
                parts = raw.split("```")
                raw = parts[1] if len(parts) > 1 else raw
                if raw.startswith("json"):
                    raw = raw[4:]
                raw = raw.strip()

            # Find JSON array boundaries
            start = raw.find("[")
            end = raw.rfind("]") + 1
            if start == -1 or end == 0:
                raise ValueError("No JSON array found in response.")
            raw = raw[start:end]

            questions = json.loads(raw)
            validation_errors = _validate_questions(questions)

            if validation_errors:
                last_error = f"Invalid question format: {'; '.join(validation_errors)}"
                if attempt == 0:
                    continue
                return {**state, "error": last_error}

            return {
                **state,
                "questions": questions,
                "current_question_index": 0,
                "score": 0,
                "error": "",
            }

        except (json.JSONDecodeError, ValueError) as exc:
            last_error = f"Failed to parse questions from AI response: {str(exc)}"
            if attempt == 0:
                continue
            return {**state, "error": last_error}

        except Exception as exc:
            return {**state, "error": f"AI service error during question generation: {str(exc)}"}

    return {**state, "error": last_error}
