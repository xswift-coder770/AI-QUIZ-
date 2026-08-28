import { useState } from 'react'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

export default function RandomQuizSetup({ onStart, onBack, error }) {
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('Medium')
  const [numQuestions, setNumQuestions] = useState(5)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !topic.trim()) return
    setLoading(true)
    await onStart({
      subject: subject.trim(),
      topic: topic.trim(),
      difficulty,
      number_of_questions: numQuestions,
    })
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto animate-slide-up">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-brand-600/20 border border-brand-500/30 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Random Quiz</h1>
            <p className="text-slate-400 text-sm">AI-generated questions on any topic</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
        {/* Subject */}
        <div>
          <label className="field-label" htmlFor="subject">Subject</label>
          <input
            id="subject"
            type="text"
            className="input-field"
            placeholder="e.g. DBMS, Operating Systems, Mathematics"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
          />
        </div>

        {/* Topic */}
        <div>
          <label className="field-label" htmlFor="topic">Topic</label>
          <input
            id="topic"
            type="text"
            className="input-field"
            placeholder="e.g. Normalization, Deadlocks, Integration"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            required
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="field-label">Difficulty</label>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                type="button"
                id={`difficulty-${d.toLowerCase()}`}
                onClick={() => setDifficulty(d)}
                className={`py-2.5 rounded-xl border-2 font-semibold text-sm transition-all duration-200
                  ${difficulty === d
                    ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600'
                  }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Number of Questions */}
        <div>
          <label className="field-label" htmlFor="num-questions">
            Number of Questions
            <span className="ml-2 text-brand-400 font-semibold">{numQuestions}</span>
          </label>
          <input
            id="num-questions"
            type="range"
            min={3}
            max={15}
            value={numQuestions}
            onChange={e => setNumQuestions(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                       accent-brand-500 mt-2"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>3</span>
            <span>15</span>
          </div>
        </div>

        {/* Submit */}
        <button
          id="btn-start-random-quiz"
          type="submit"
          disabled={loading || !subject.trim() || !topic.trim()}
          className="btn-primary w-full mt-2"
        >
          {loading ? 'Generating...' : 'Start Quiz →'}
        </button>
      </form>
    </div>
  )
}
