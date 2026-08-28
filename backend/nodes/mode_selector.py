"""
mode_selector.py
----------------
Determines which workflow path to follow based on state["mode"].

This node does NOT generate questions.
It only validates and prepares the state for conditional routing in graph.py.
"""

from typing import Any


def mode_selector(state: dict[str, Any]) -> dict[str, Any]:
    """
    Read state["mode"] and verify it is a valid mode.
    The actual routing decision is made by the conditional edge in graph.py.
    """
    mode = state.get("mode", "").strip().lower()

    if mode not in ("random", "notes"):
        return {**state, "error": f"Invalid mode '{mode}'. Must be 'random' or 'notes'."}

    # Normalize mode value just in case
    return {**state, "mode": mode, "error": ""}
