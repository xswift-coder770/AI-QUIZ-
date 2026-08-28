export default function SummaryView({ summary, keyPoints, onStartQuiz, onBack }) {
  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl mb-4">
          <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Your Notes Summary</h1>
        <p className="text-slate-400">Here's what the AI extracted from your study material</p>
      </div>

      {/* Summary Card */}
      <div className="glass-card p-6 mb-5">
        <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">Summary</h2>
        <p className="text-slate-300 leading-relaxed">{summary}</p>
      </div>

      {/* Key Points Card */}
      {keyPoints && keyPoints.length > 0 && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4">Key Points</h2>
          <ul className="space-y-3">
            {keyPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="w-5 h-5 bg-brand-500/20 text-brand-400 rounded-full flex items-center justify-center
                                 text-xs font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-slate-300 text-sm leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-slate-800"></div>
        <span className="text-slate-500 text-sm">Ready to test yourself?</span>
        <div className="flex-1 h-px bg-slate-800"></div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          id="btn-start-notes-quiz"
          onClick={onStartQuiz}
          className="flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 active:scale-95
                     bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/25
                     flex items-center justify-center gap-2"
        >
          Start Quiz
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
        <button
          id="btn-back-from-summary"
          onClick={onBack}
          className="btn-secondary px-6 py-3"
        >
          Upload Different PDF
        </button>
      </div>
    </div>
  )
}
