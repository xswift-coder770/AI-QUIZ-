"""
graph.py
--------
Defines the LangGraph workflow for the AI Study Assistant.

This file contains ONLY:
  - State definition (QuizState)
  - Graph creation
  - Node registration
  - Edges (normal and conditional)
  - Graph compilation

No business logic lives here — all logic is in the nodes/ directory.

Workflow:
                     START
                       |
                       ↓
                mode_selector
                       |
              ┌────────┴────────┐
              ↓                 ↓
           RANDOM             NOTES
              ↓                 ↓
    generate_questions     extract_notes
                                ↓
                          summarize_notes
                                ↓
                          generate_questions
"""

from typing import Any, TypedDict

from langgraph.graph import StateGraph, END

from nodes.mode_selector import mode_selector
from nodes.extract_notes import extract_notes
from nodes.summarize_notes import summarize_notes
from nodes.generate_questions import generate_questions
from nodes.evaluate_answer import evaluate_answer


# --------------------------------------------------------------------------- #
# State Definition                                                             #
# --------------------------------------------------------------------------- #
class QuizState(TypedDict):
    # Routing
    mode: str                       # "random" | "notes"

    # Random mode inputs
    subject: str
    topic: str
    difficulty: str
    number_of_questions: int

    # Notes mode inputs
    pdf_path: str
    notes_text: str
    summary: str
    key_points: list

    # Quiz state
    questions: list                 # List of MCQ question dicts
    current_question_index: int
    user_answer: str
    evaluation: dict
    score: int

    # Error propagation
    error: str


# --------------------------------------------------------------------------- #
# Conditional Routing Functions                                                #
# --------------------------------------------------------------------------- #
def route_by_mode(state: QuizState) -> str:
    """
    Conditional edge after mode_selector.
    Routes to the correct next node based on state["mode"].
    """
    if state.get("error"):
        return END

    if state["mode"] == "notes":
        return "extract_notes"
    else:
        return "generate_questions"


def check_more_questions(state: QuizState) -> str:
    """
    Conditional edge after evaluate_answer.
    Routes back to evaluate_answer for the next question,
    or ends the graph if all questions are answered.

    Note: In the stateless API design, this graph is used for question generation
    and single-answer evaluation. The loop logic is shown here for architectural
    completeness and interview demonstration.
    """
    if state.get("error"):
        return END

    current_index = state.get("current_question_index", 0)
    total_questions = len(state.get("questions", []))

    if current_index < total_questions:
        return "evaluate_answer"
    else:
        return END


# --------------------------------------------------------------------------- #
# Graph Construction                                                           #
# --------------------------------------------------------------------------- #
def build_quiz_graph() -> StateGraph:
    """
    Build and compile the LangGraph workflow.
    Returns the compiled graph ready for invocation.
    """
    graph = StateGraph(QuizState)

    # --- Register nodes ---
    # Note: evaluate_answer is NOT part of the quiz generation graph.
    # It lives in the evaluation_graph (used by /quiz/answer endpoint).
    graph.add_node("mode_selector", mode_selector)
    graph.add_node("extract_notes", extract_notes)
    graph.add_node("summarize_notes", summarize_notes)
    graph.add_node("generate_questions", generate_questions)

    # --- Entry point ---
    graph.set_entry_point("mode_selector")

    # --- Conditional routing after mode_selector ---
    graph.add_conditional_edges(
        "mode_selector",
        route_by_mode,
        {
            "extract_notes": "extract_notes",
            "generate_questions": "generate_questions",
            END: END,
        },
    )

    # --- Notes mode: linear path through extraction and summarization ---
    graph.add_edge("extract_notes", "summarize_notes")
    graph.add_edge("summarize_notes", "generate_questions")

    # --- After question generation, end (questions returned to API caller) ---
    graph.add_edge("generate_questions", END)

    return graph.compile()


# --- Evaluation sub-graph (used by /quiz/answer endpoint) ---
def build_evaluation_graph() -> StateGraph:
    """
    A minimal graph for evaluating a single answer.
    Demonstrates the conditional edge pattern for the quiz loop.
    """
    graph = StateGraph(QuizState)

    graph.add_node("evaluate_answer", evaluate_answer)

    graph.set_entry_point("evaluate_answer")

    graph.add_conditional_edges(
        "evaluate_answer",
        check_more_questions,
        {
            # In stateless API mode, we process one answer at a time.
            # Both paths end the graph; the frontend handles the loop.
            "evaluate_answer": END,
            END: END,
        },
    )

    return graph.compile()


# Module-level compiled graphs (instantiated once on startup)
quiz_graph = build_quiz_graph()
evaluation_graph = build_evaluation_graph()
