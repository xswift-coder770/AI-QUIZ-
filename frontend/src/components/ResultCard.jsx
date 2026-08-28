export default function ResultCard({ score, total, onTryAgain, onGoHome }) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0
  const incorrect = total - score

  // Determine feedback message
  const getFeedback = () => {
    if (percentage === 100) return { text: "Perfect score! Outstanding! 🎉", color: "text-yellow-400" }
    if (percentage >= 80) return { text: "Great job! Keep it up! 🌟", color: "text-emerald-400" }
    if (percentage >= 60) return { text: "Good effort! Review and try again.", color: "text-brand-400" }
    if (percentage >= 40) return { text: "Keep practicing — you're getting there!", color: "text-amber-400" }
    return { text: "Don't give up! Review your notes and try again.", color: "text-red-400" }
  }

  const feedback = getFeedback()

  // Stroke dash for circle progress
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDash = circumference - (percentage / 100) * circumference

  return (
    <div className="max-w-md mx-auto animate-slide-up text-center">
      {/* Trophy icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600/20 border border-brand-500/30 rounded-2xl mb-6">
        <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M5 3h14M5 3a2 2 0 00-2 2v3a2 2 0 002 2h.5M5 3h14m0 0a2 2 0 012 2v3a2 2 0 01-2 2h-.5M9 10v4a3 3 0 006 0v-4M7 21h10M12 17v4" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h1>
      <p className={`text-lg font-medium mb-8 ${feedback.color}`}>{feedback.text}</p>

      {/* Circular progress */}
      <div className="flex justify-center mb-8">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Background track */}
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
            {/* Progress arc */}
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={percentage >= 80 ? '#10b981' : percentage >= 60 ? '#6366f1' : percentage >= 40 ? '#f59e0b' : '#ef4444'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDash}
              className="transition-all duration-1000"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-white">{score}/{total}</span>
            <span className="text-slate-400 text-sm font-medium">{percentage}%</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="glass-card p-6 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span className="text-slate-400 text-sm">Correct</span>
            </div>
            <span className="text-2xl font-bold text-emerald-400">{score}</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-slate-400 text-sm">Incorrect</span>
            </div>
            <span className="text-2xl font-bold text-red-400">{incorrect}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          id="btn-try-again"
          onClick={onTryAgain}
          className="btn-primary flex-1"
        >
          Try Again
        </button>
        <button
          id="btn-go-home"
          onClick={onGoHome}
          className="btn-secondary flex-1"
        >
          Go Home
        </button>
      </div>
    </div>
  )
}
