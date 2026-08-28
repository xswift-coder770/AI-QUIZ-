/**
 * QuestionCard — displays a single MCQ question and handles option selection.
 *
 * Props:
 *   question     — the question object { question, options, correct_answer, explanation }
 *   questionNum  — 1-based question number
 *   total        — total number of questions
 *   onSubmit     — callback(selectedOption: string)
 *   evaluation   — null | { is_correct, correct_answer, explanation, user_answer }
 *   onNext       — callback() to advance to next question
 */
import { useState } from 'react'

export default function QuestionCard({ question, questionNum, total, onSubmit, evaluation, onNext }) {
  const [selected, setSelected] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const progress = ((questionNum - 1) / total) * 100

  const handleSubmit = async () => {
    if (!selected || submitting) return
    setSubmitting(true)
    await onSubmit(selected)
    setSubmitting(false)
  }

  const getOptionStyle = (option) => {
    if (!evaluation) {
      // Pre-submission
      return selected === option ? 'option-card option-card-selected' : 'option-card option-card-idle'
    }
    // Post-submission
    if (option === evaluation.correct_answer) return 'option-card option-card-correct'
    if (option === evaluation.user_answer && !evaluation.is_correct) return 'option-card option-card-incorrect'
    return 'option-card border-slate-700/50 bg-slate-800/30 text-slate-500 cursor-default'
  }

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      {/* Progress header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-sm font-medium">Question {questionNum} of {total}</span>
          <span className="text-brand-400 text-sm font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="glass-card p-8 mb-4">
        <h2 className="text-xl font-semibold text-white leading-relaxed mb-8">
          {question.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              id={`option-${idx}`}
              onClick={() => !evaluation && setSelected(option)}
              disabled={!!evaluation}
              className={getOptionStyle(option)}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold
                  ${!evaluation && selected === option
                    ? 'border-brand-400 bg-brand-400 text-white'
                    : evaluation && option === evaluation.correct_answer
                      ? 'border-emerald-400 bg-emerald-400 text-white'
                      : evaluation && option === evaluation.user_answer && !evaluation.is_correct
                        ? 'border-red-400 bg-red-400 text-white'
                        : 'border-slate-600 text-slate-500'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                {option}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Evaluation feedback */}
      {evaluation && (
        <div className={`rounded-xl p-5 mb-4 border animate-slide-up
          ${evaluation.is_correct
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {evaluation.is_correct ? (
              <>
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-400 font-semibold">Correct!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-red-400 font-semibold">Incorrect</span>
              </>
            )}
          </div>

          {!evaluation.is_correct && (
            <p className="text-slate-300 text-sm mb-2">
              <span className="text-slate-400">Correct answer: </span>
              <span className="font-semibold text-emerald-300">{evaluation.correct_answer}</span>
            </p>
          )}

          <p className="text-slate-400 text-sm leading-relaxed">
            <span className="text-slate-300 font-medium">Explanation: </span>
            {evaluation.explanation}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {!evaluation ? (
          <button
            id="btn-submit-answer"
            onClick={handleSubmit}
            disabled={!selected || submitting}
            className="btn-primary flex-1"
          >
            {submitting ? 'Checking...' : 'Submit Answer'}
          </button>
        ) : (
          <button
            id="btn-next-question"
            onClick={onNext}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {questionNum < total ? 'Next Question' : 'See Results'}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
