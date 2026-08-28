"""
summarize_notes.py
------------------
Sends extracted notes to the LLM (via OpenAI-compatible API — Groq / xAI)
and returns a concise summary with key points.

Only used in Notes Mode.
Uses the openai SDK directly — no langchain-openai dependency.
The prompt strongly restricts the model to the supplied notes only.
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
# System prompt — strictly grounded to the supplied notes                     #
# --------------------------------------------------------------------------- #
SUMMARIZE_SYSTEM_PROMPT = """You are a study-notes summarizer for college students.

STRICT RULES:
- Use ONLY the information present in the notes provided by the user.
- Do NOT add any information from your own training knowledge.
- Do NOT invent, assume, or extrapolate facts not present in the notes.
- Do NOT introduce definitions, examples, or concepts that are not in the notes.

Your task:
1. Write a concise, student-friendly summary of the supplied notes.
2. Extract the most important concepts and key points as a bullet list.

You MUST respond with valid JSON in exactly this format:
{
  "summary": "A concise paragraph summarizing the notes.",
  "key_points": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ]
}

Do not include any text outside the JSON object."""


def summarize_notes(state: dict[str, Any]) -> dict[str, Any]:
    """
    Summarize state["notes_text"] using the LLM.
    Stores summary and key_points back into state.
    """
    notes_text = state.get("notes_text", "").strip()

    if not notes_text:
        return {**state, "error": "No notes text available to summarize."}

    # Truncate extremely long notes to avoid token limits (~12,000 chars ≈ ~3k tokens)
    if len(notes_text) > 12000:
        notes_text = notes_text[:12000] + "\n\n[Note: content truncated for processing]"

    client = _get_client()
    model = os.environ["XAI_MODEL"]

    messages = [
        {"role": "system", "content": SUMMARIZE_SYSTEM_PROMPT},
        {"role": "user", "content": f"Here are the study notes to summarize:\n\n{notes_text}"},
    ]

    # --- Call LLM with one retry on JSON parse failure ---
    for attempt in range(2):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.3,
            )
            raw = response.choices[0].message.content.strip()

            # Strip markdown code fences if model wrapped the JSON
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
                raw = raw.strip()

            parsed = json.loads(raw)

            summary = parsed.get("summary", "").strip()
            key_points = parsed.get("key_points", [])

            if not summary:
                raise ValueError("Summary field is empty.")
            if not isinstance(key_points, list):
                key_points = []

            return {
                **state,
                "summary": summary,
                "key_points": key_points,
                "error": "",
            }

        except (json.JSONDecodeError, ValueError, KeyError) as exc:
            if attempt == 1:
                return {
                    **state,
                    "error": f"Failed to parse summary from AI response: {str(exc)}",
                }
            continue  # Retry once

        except Exception as exc:
            return {**state, "error": f"AI service error during summarization: {str(exc)}"}
