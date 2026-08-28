"""
evaluate_answer.py
------------------
Evaluates the user's MCQ answer deterministically.

Since this is a multiple-choice quiz, evaluation is a simple string comparison.
No LLM call is needed — this makes evaluation fast, reliable, and cost-free.

The explanation comes from the pre-generated question data.
"""

from typing import Any


def evaluate_answer(state: dict[str, Any]) -> dict[str, Any]:
    """
    Compare state["user_answer"] with the correct answer for the current question.
    Update state["score"] and state["evaluation"].
    Advance state["current_question_index"] for the next question.
    """
    questions = state.get("questions", [])
    current_index = state.get("current_question_index", 0)
    user_answer = state.get("user_answer", "").strip()
    score = state.get("score", 0)

    # --- Validate state ---
    if not questions:
        return {**state, "error": "No questions available to evaluate."}

    if current_index >= len(questions):
        return {**state, "error": "Question index out of range."}

    current_question = questions[current_index]
    correct_answer = current_question.get("correct_answer", "")
    explanation = current_question.get("explanation", "No explanation available.")

    # --- Deterministic evaluation ---
    is_correct = user_answer.strip() == correct_answer.strip()

    if is_correct:
        score += 1

    evaluation = {
        "is_correct": is_correct,
        "correct_answer": correct_answer,
        "explanation": explanation,
        "user_answer": user_answer,
        "question_index": current_index,
    }

    # Advance to next question
    next_index = current_index + 1

    return {
        **state,
        "evaluation": evaluation,
        "score": score,
        "current_question_index": next_index,
        "error": "",
    }
