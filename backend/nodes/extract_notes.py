"""
extract_notes.py
----------------
Extracts plain text from an uploaded PDF file using PyMuPDF.

Only used in Notes Mode.
Does NOT call the LLM.
"""

import os
from typing import Any

import fitz  # PyMuPDF


def extract_notes(state: dict[str, Any]) -> dict[str, Any]:
    """
    Read the PDF at state["pdf_path"] and extract all text.
    Stores the result in state["notes_text"].
    """
    pdf_path = state.get("pdf_path", "")

    # --- Validate the path ---
    if not pdf_path:
        return {**state, "error": "No PDF file path provided."}

    if not os.path.exists(pdf_path):
        return {**state, "error": "Uploaded PDF file not found on server."}

    # --- Open and read the PDF ---
    try:
        doc = fitz.open(pdf_path)
    except Exception as exc:
        return {**state, "error": f"Could not open PDF: {str(exc)}"}

    if doc.page_count == 0:
        doc.close()
        return {**state, "error": "The uploaded PDF has no pages."}

    # Collect text from every page
    pages_text: list[str] = []
    for page in doc:
        text = page.get_text("text").strip()
        if text:
            pages_text.append(text)

    doc.close()

    # --- Validate extracted content ---
    if not pages_text:
        return {
            **state,
            "error": (
                "We couldn't find readable text in this PDF. "
                "Make sure it contains selectable text (not scanned images)."
            ),
        }

    full_text = "\n\n".join(pages_text)

    # Sanity check — at least 50 characters of real content
    if len(full_text.strip()) < 50:
        return {
            **state,
            "error": "The PDF contains too little text to generate a meaningful quiz.",
        }

    return {**state, "notes_text": full_text, "error": ""}
