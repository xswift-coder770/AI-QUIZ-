# AI Study Assistant

> A college-level portfolio project demonstrating **LangGraph**, **Grok AI**, **stateful workflows**, **PDF processing**, and a modern **React + FastAPI** architecture.

---

## Features

- **Random AI Quizzes** — generate MCQs on any subject and topic at your chosen difficulty
- **PDF-Based Quizzes** — upload study notes and get a quiz grounded entirely in your material
- **Notes Summarization** — AI extracts a concise summary and key points from your PDF
- **Notes-Grounded Question Generation** — model is explicitly restricted to your notes only (no hallucination)
- **Automatic Answer Evaluation** — deterministic MCQ comparison; no extra LLM call per answer
- **LangGraph Workflow** — stateful, conditional routing between Random and Notes paths
- **Clean Architecture** — `main.py` (API) → `graph.py` (workflow) → `nodes/` (logic)

---

## Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS            |
| Backend     | Python, FastAPI, Uvicorn                |
| AI Workflow | LangGraph, LangChain                    |
| LLM         | Grok API (`openai/gpt-oss-120b`) via OpenAI-compatible interface |
| PDF         | PyMuPDF (fitz)                          |

---

## Architecture

```
React (Vite + Tailwind)
        ↓  fetch (REST)
FastAPI (main.py)
        ↓  invoke
LangGraph (graph.py)
        ↓  nodes
  ┌─────────────────────────────┐
  │  mode_selector              │
  │  extract_notes (PyMuPDF)   │
  │  summarize_notes (Grok)    │
  │  generate_questions (Grok) │
  │  evaluate_answer (logic)   │
  └─────────────────────────────┘
        ↓
   Grok API (xAI)
   openai/gpt-oss-120b
```

### LangGraph Workflow

```
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
                                ↓
                          evaluate_answer
                                ↓
                          more questions?
                            /         \
                          YES          NO
                           ↓            ↓
                     next question     END
                           |
                           └──────────→ evaluate_answer
```

---

## Project Structure

```
ai-study-assistant/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ModeSelector.jsx
│   │   │   ├── RandomQuizSetup.jsx
│   │   │   ├── NotesUpload.jsx
│   │   │   ├── SummaryView.jsx
│   │   │   ├── Quiz.jsx
│   │   │   ├── QuestionCard.jsx
│   │   │   ├── ResultCard.jsx
│   │   │   └── Loading.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── nodes/
│   │   ├── mode_selector.py
│   │   ├── extract_notes.py
│   │   ├── summarize_notes.py
│   │   ├── generate_questions.py
│   │   └── evaluate_answer.py
│   ├── graph.py
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
│
└── README.md
```

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ai-study-assistant
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env      # Windows
# cp .env.example .env      # macOS/Linux

# Edit .env and add your Grok API key:
# XAI_API_KEY=your_actual_api_key_here
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

---

## Running the Application

### Start the Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

The API will be available at: http://localhost:8000

Verify: http://localhost:8000/health

### Start the Frontend

```bash
cd frontend
npm run dev
```

The app will be available at: http://localhost:5173

---

## API Endpoints

| Method | Endpoint       | Description                          |
|--------|----------------|--------------------------------------|
| GET    | `/health`      | Health check                         |
| POST   | `/quiz/random` | Generate questions for a topic       |
| POST   | `/quiz/notes`  | Upload PDF and generate notes quiz   |
| POST   | `/quiz/answer` | Evaluate a single MCQ answer         |

### POST /quiz/random

```json
{
  "subject": "DBMS",
  "topic": "Normalization",
  "difficulty": "Medium",
  "number_of_questions": 5
}
```

### POST /quiz/notes

`multipart/form-data`:
- `file` — PDF file
- `difficulty` — "Easy" | "Medium" | "Hard"
- `number_of_questions` — integer

### POST /quiz/answer

```json
{
  "questions": [...],
  "current_index": 0,
  "user_answer": "Reduce data redundancy",
  "score": 0
}
```

---

## Environment Variables

```env
XAI_API_KEY=your_api_key_here
XAI_BASE_URL=https://api.x.ai/v1
XAI_MODEL=openai/gpt-oss-120b
```

Get your API key from: https://console.x.ai/

---

## Interview Q&A

**Why LangGraph?**
> The application has multiple steps with conditional routing. Random Quiz and Notes Quiz follow different paths, and after every answer the graph decides whether to continue or end the quiz.

**What is State?**
> The state contains the current mode, topic, notes, summary, generated questions, current index, user's answer, evaluation, and score. Nodes read and update this shared state.

**What is a Conditional Edge?**
> The mode selector uses conditional routing — Random mode goes directly to question generation, while Notes mode goes through text extraction and summarization first.

**Why deterministic answer evaluation?**
> MCQs are compared by string — no LLM call needed. This is faster, cheaper, and more reliable than asking the model to evaluate every answer.

**How do you prevent hallucination in Notes Mode?**
> The prompts explicitly restrict the model to the uploaded notes. Every question must be answerable from the notes, not general knowledge.

---

## License

MIT
