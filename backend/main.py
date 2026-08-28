"""
main.py
-------
FastAPI application — the API/input layer.

Responsibilities:
  - Define API routes
  - Accept and validate incoming requests
  - Handle file uploads
  - Invoke the LangGraph workflow
  - Return clean JSON responses
  - Handle API-level errors gracefully

Does NOT contain:
  - LangGraph node logic
  - LLM prompts
  - PDF extraction logic
  - Question generation logic
  - Evaluation logic
"""

import os
import tempfile
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Load environment variables from .env before importing graph
# override=True ensures we don't use stale variables if the server reloads
load_dotenv(override=True)

from graph import quiz_graph, evaluation_graph  # noqa: E402 (must come after load_dotenv)


# --------------------------------------------------------------------------- #
# Application Lifecycle                                                        #
# --------------------------------------------------------------------------- #
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Verify required environment variables are present on startup
    required_vars = ["XAI_API_KEY", "XAI_BASE_URL", "XAI_MODEL"]
    missing = [var for var in required_vars if not os.environ.get(var)]
    if missing:
        raise RuntimeError(
            f"Missing required environment variables: {', '.join(missing)}. "
            "Please copy .env.example to .env and fill in your API key."
        )
    yield


# --------------------------------------------------------------------------- #
# FastAPI App                                                                  #
# --------------------------------------------------------------------------- #
app = FastAPI(
    title="AI Study Assistant API",
    description="Backend for the AI Study Assistant — LangGraph + Grok API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow React dev server (Vite default port 5173) and common alternatives
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://frontend-lime-nine-47.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------------------------------- #
# Request / Response Models                                                    #
# --------------------------------------------------------------------------- #
class RandomQuizRequest(BaseModel):
    subject: str = Field(..., min_length=1, max_length=100)
    topic: str = Field(..., min_length=1, max_length=200)
    difficulty: str = Field(default="Medium")
    number_of_questions: int = Field(default=5, ge=1, le=20)


class AnswerRequest(BaseModel):
    questions: list = Field(..., min_length=1)
    current_index: int = Field(..., ge=0)
    user_answer: str = Field(..., min_length=1)
    score: int = Field(default=0, ge=0)


# --------------------------------------------------------------------------- #
# Helper — clean error response                                               #
# --------------------------------------------------------------------------- #
def _check_for_error(result: dict, context: str = "") -> None:
    """Raise HTTPException if the graph returned an error."""
    error = result.get("error", "")
    if error:
        prefix = f"{context}: " if context else ""
        raise HTTPException(status_code=422, detail=f"{prefix}{error}")


# --------------------------------------------------------------------------- #
# Routes                                                                       #
# --------------------------------------------------------------------------- #
@app.get("/health")
async def health():
    """Health check — confirm the API is running and env vars are loaded."""
    return {
        "status": "ok",
        "model": os.environ.get("XAI_MODEL", "not configured"),
        "api_configured": bool(os.environ.get("XAI_API_KEY")),
    }


@app.post("/quiz/random")
async def create_random_quiz(request: RandomQuizRequest):
    """
    Generate MCQ questions for a given subject and topic.

    Flow: FastAPI → LangGraph → mode_selector → generate_questions
    """
    initial_state = {
        "mode": "random",
        "subject": request.subject,
        "topic": request.topic,
        "difficulty": request.difficulty,
        "number_of_questions": request.number_of_questions,
        "pdf_path": "",
        "notes_text": "",
        "summary": "",
        "key_points": [],
        "questions": [],
        "current_question_index": 0,
        "user_answer": "",
        "evaluation": {},
        "score": 0,
        "error": "",
    }

    try:
        result = quiz_graph.invoke(initial_state)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Something went wrong while generating the quiz. Please try again. ({str(exc)})",
        )

    _check_for_error(result, "Question generation failed")

    return {
        "mode": "random",
        "subject": request.subject,
        "topic": request.topic,
        "difficulty": request.difficulty,
        "questions": result["questions"],
    }


@app.post("/quiz/notes")
async def create_notes_quiz(
    file: UploadFile = File(...),
    difficulty: str = Form(default="Medium"),
    number_of_questions: int = Form(default=5),
):
    """
    Upload a PDF, extract text, summarize it, and generate notes-grounded questions.

    Flow: FastAPI → LangGraph → mode_selector → extract_notes → summarize_notes → generate_questions
    """
    # --- Validate file type ---
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a valid PDF file.")

    # --- Validate file size (max 10 MB) ---
    MAX_SIZE = 10 * 1024 * 1024  # 10 MB
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(
            status_code=413,
            detail="PDF file is too large. Maximum allowed size is 10 MB.",
        )

    # --- Save PDF to a temporary file ---
    tmp_file_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(contents)
            tmp_file_path = tmp.name

        initial_state = {
            "mode": "notes",
            "subject": "",
            "topic": "",
            "difficulty": difficulty,
            "number_of_questions": number_of_questions,
            "pdf_path": tmp_file_path,
            "notes_text": "",
            "summary": "",
            "key_points": [],
            "questions": [],
            "current_question_index": 0,
            "user_answer": "",
            "evaluation": {},
            "score": 0,
            "error": "",
        }

        try:
            result = quiz_graph.invoke(initial_state)
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Something went wrong while processing your notes. Please try again. ({str(exc)})",
            )

        _check_for_error(result, "Notes processing failed")

        return {
            "mode": "notes",
            "summary": result.get("summary", ""),
            "key_points": result.get("key_points", []),
            "questions": result.get("questions", []),
        }

    finally:
        # Always clean up the temporary PDF file
        if tmp_file_path and os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)


@app.post("/quiz/answer")
async def submit_answer(request: AnswerRequest):
    """
    Evaluate a single MCQ answer deterministically.

    Flow: FastAPI → LangGraph (evaluation_graph) → evaluate_answer

    No LLM call is made — evaluation is a string comparison.
    The explanation comes from the pre-generated question data.
    """
    if request.current_index >= len(request.questions):
        raise HTTPException(status_code=400, detail="Question index out of range.")

    initial_state = {
        "mode": "",
        "subject": "",
        "topic": "",
        "difficulty": "",
        "number_of_questions": len(request.questions),
        "pdf_path": "",
        "notes_text": "",
        "summary": "",
        "key_points": [],
        "questions": request.questions,
        "current_question_index": request.current_index,
        "user_answer": request.user_answer,
        "evaluation": {},
        "score": request.score,
        "error": "",
    }

    try:
        result = evaluation_graph.invoke(initial_state)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Something went wrong while evaluating your answer. ({str(exc)})",
        )

    _check_for_error(result, "Answer evaluation failed")

    return {
        "evaluation": result["evaluation"],
        "score": result["score"],
        "next_index": result["current_question_index"],
        "is_finished": result["current_question_index"] >= len(request.questions),
    }
