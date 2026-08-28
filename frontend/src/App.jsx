import { useState } from 'react'
import ModeSelector from './components/ModeSelector'
import RandomQuizSetup from './components/RandomQuizSetup'
import NotesUpload from './components/NotesUpload'
import SummaryView from './components/SummaryView'
import Quiz from './components/Quiz'
import ResultCard from './components/ResultCard'
import Loading from './components/Loading'

const API_URL = import.meta.env.VITE_API_URL || '';

// View names for the app state machine
const VIEWS = {
  HOME: 'home',
  RANDOM_SETUP: 'random_setup',
  NOTES_UPLOAD: 'notes_upload',
  LOADING: 'loading',
  SUMMARY: 'summary',
  QUIZ: 'quiz',
  RESULT: 'result',
}

export default function App() {
  const [view, setView] = useState(VIEWS.HOME)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [quizData, setQuizData] = useState(null)   // { questions, mode, subject?, topic?, summary?, key_points? }
  const [quizResult, setQuizResult] = useState(null) // { score, total }
  const [error, setError] = useState('')

  // -------------------------------------------------------------------------
  // Navigation helpers
  // -------------------------------------------------------------------------
  const goHome = () => {
    setView(VIEWS.HOME)
    setQuizData(null)
    setQuizResult(null)
    setError('')
  }

  const goToRandomSetup = () => {
    setError('')
    setView(VIEWS.RANDOM_SETUP)
  }

  const goToNotesUpload = () => {
    setError('')
    setView(VIEWS.NOTES_UPLOAD)
  }

  // -------------------------------------------------------------------------
  // Random Quiz Flow
  // -------------------------------------------------------------------------
  const handleRandomQuizStart = async ({ subject, topic, difficulty, number_of_questions }) => {
    setError('')
    setLoadingMessage('Generating your questions...')
    setView(VIEWS.LOADING)

    try {
      const res = await fetch(`${API_URL}/quiz/random`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, topic, difficulty, number_of_questions }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || 'Something went wrong while generating the quiz. Please try again.')
      }

      setQuizData({
        mode: 'random',
        subject,
        topic,
        questions: data.questions,
      })
      setView(VIEWS.QUIZ)

    } catch (err) {
      setError(err.message)
      setView(VIEWS.RANDOM_SETUP)
    }
  }

  // -------------------------------------------------------------------------
  // Notes Quiz Flow
  // -------------------------------------------------------------------------
  const handleNotesQuizStart = async ({ file, difficulty, number_of_questions }) => {
    setError('')

    // Stage 1 — reading notes
    setLoadingMessage('Reading your notes...')
    setView(VIEWS.LOADING)

    // Simulate staged loading messages for better UX
    const messageTimers = []
    messageTimers.push(setTimeout(() => setLoadingMessage('Creating your summary...'), 4000))
    messageTimers.push(setTimeout(() => setLoadingMessage('Creating questions from your notes...'), 10000))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('difficulty', difficulty)
      formData.append('number_of_questions', number_of_questions)

      const res = await fetch(`${API_URL}/quiz/notes`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      messageTimers.forEach(clearTimeout)

      if (!res.ok) {
        throw new Error(data.detail || 'Something went wrong while processing your notes. Please try again.')
      }

      setQuizData({
        mode: 'notes',
        summary: data.summary,
        key_points: data.key_points,
        questions: data.questions,
      })
      setView(VIEWS.SUMMARY)

    } catch (err) {
      messageTimers.forEach(clearTimeout)
      setError(err.message)
      setView(VIEWS.NOTES_UPLOAD)
    }
  }

  // -------------------------------------------------------------------------
  // Answer submission
  // -------------------------------------------------------------------------
  const handleAnswerSubmit = async ({ questions, currentIndex, userAnswer, score }) => {
    const res = await fetch(`${API_URL}/quiz/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questions,
        current_index: currentIndex,
        user_answer: userAnswer,
        score,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.detail || 'Something went wrong while evaluating your answer.')
    }

    return data
  }

  // -------------------------------------------------------------------------
  // Quiz completion
  // -------------------------------------------------------------------------
  const handleQuizComplete = (score, total) => {
    setQuizResult({ score, total })
    setView(VIEWS.RESULT)
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-glow">
      {/* Header */}
      <header className="border-b border-slate-800/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={goHome}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center
                            group-hover:bg-brand-500 transition-colors duration-200">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-white text-lg tracking-tight group-hover:text-brand-300 transition-colors duration-200">
              AI Study Assistant
            </span>
          </button>

          {view !== VIEWS.HOME && (
            <button onClick={goHome} className="text-slate-400 hover:text-slate-200 text-sm transition-colors duration-200 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Home
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        {view === VIEWS.HOME && (
          <ModeSelector onRandomQuiz={goToRandomSetup} onNotesQuiz={goToNotesUpload} />
        )}

        {view === VIEWS.RANDOM_SETUP && (
          <RandomQuizSetup onStart={handleRandomQuizStart} onBack={goHome} error={error} />
        )}

        {view === VIEWS.NOTES_UPLOAD && (
          <NotesUpload onStart={handleNotesQuizStart} onBack={goHome} error={error} />
        )}

        {view === VIEWS.LOADING && (
          <Loading message={loadingMessage} />
        )}

        {view === VIEWS.SUMMARY && quizData && (
          <SummaryView
            summary={quizData.summary}
            keyPoints={quizData.key_points}
            onStartQuiz={() => setView(VIEWS.QUIZ)}
            onBack={goHome}
          />
        )}

        {view === VIEWS.QUIZ && quizData && (
          <Quiz
            questions={quizData.questions}
            onAnswerSubmit={handleAnswerSubmit}
            onComplete={handleQuizComplete}
          />
        )}

        {view === VIEWS.RESULT && quizResult && (
          <ResultCard
            score={quizResult.score}
            total={quizResult.total}
            onTryAgain={quizData?.mode === 'random' ? goToRandomSetup : goToNotesUpload}
            onGoHome={goHome}
          />
        )}
      </main>
    </div>
  )
}
