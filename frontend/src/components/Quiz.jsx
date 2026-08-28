/**
 * Quiz — manages the quiz session state.
 * Calls onAnswerSubmit per question, tracks score, calls onComplete when done.
 */
import { useState, useRef } from 'react'
import QuestionCard from './QuestionCard'

export default function Quiz({ questions, onAnswerSubmit, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [evaluation, setEvaluation] = useState(null)  // current question's evaluation result
  const [apiError, setApiError] = useState('')

  // Use a ref to track the latest score synchronously for completion callback
  const scoreRef = useRef(0)

  const currentQuestion = questions[currentIndex]
  const total = questions.length

  const handleSubmit = async (selectedAnswer) => {
    setApiError('')
    try {
      const result = await onAnswerSubmit({
        questions,
        currentIndex,
        userAnswer: selectedAnswer,
        score: scoreRef.current,
      })
      setEvaluation(result.evaluation)
      setScore(result.score)
      scoreRef.current = result.score
    } catch (err) {
      setApiError(err.message || 'Something went wrong while evaluating your answer.')
    }
  }

  const handleNext = () => {
    const nextIndex = currentIndex + 1
    if (nextIndex >= total) {
      // Quiz complete — use ref for the most up-to-date score
      onComplete(scoreRef.current, total)
    } else {
      setCurrentIndex(nextIndex)
      setEvaluation(null)
      setApiError('')
    }
  }

  return (
    <div>
      {apiError && (
        <div className="max-w-2xl mx-auto mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-300 text-sm">{apiError}</p>
        </div>
      )}

      <QuestionCard
        question={currentQuestion}
        questionNum={currentIndex + 1}
        total={total}
        onSubmit={handleSubmit}
        evaluation={evaluation}
        onNext={handleNext}
      />
    </div>
  )
}
