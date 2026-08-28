export default function ModeSelector({ onRandomQuiz, onNotesQuiz }) {
  return (
    <div className="animate-slide-up">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20
                        text-brand-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse-slow"></span>
          Powered by Grok AI
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
          AI Study Assistant
        </h1>
        <p className="text-slate-400 text-xl max-w-lg mx-auto leading-relaxed">
          Learn smarter. Practice better.
          <br />
          <span className="text-slate-300">Choose how you want to study today.</span>
        </p>
      </div>

      {/* Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Random Quiz Card */}
        <button
          id="btn-random-quiz"
          onClick={onRandomQuiz}
          className="glass-card p-8 text-left group hover:border-brand-500/40 transition-all duration-300
                     hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-1"
        >
          <div className="w-14 h-14 bg-brand-600/20 border border-brand-500/30 rounded-2xl flex items-center justify-center mb-6
                          group-hover:bg-brand-600/30 transition-colors duration-300">
            <svg className="w-7 h-7 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-brand-300 transition-colors duration-200">
            Random Quiz
          </h2>
          <p className="text-slate-400 leading-relaxed mb-6">
            Practice any subject or topic with AI-generated multiple-choice questions. Pick your difficulty and number of questions.
          </p>

          <div className="flex items-center gap-2 text-brand-400 font-semibold text-sm">
            Start practicing
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </button>

        {/* My Notes Card */}
        <button
          id="btn-my-notes"
          onClick={onNotesQuiz}
          className="glass-card p-8 text-left group hover:border-emerald-500/40 transition-all duration-300
                     hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1"
        >
          <div className="w-14 h-14 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-6
                          group-hover:bg-emerald-600/30 transition-colors duration-300">
            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors duration-200">
            My Notes
          </h2>
          <p className="text-slate-400 leading-relaxed mb-6">
            Upload your study notes as a PDF. Get an AI-generated summary and a quiz built entirely from your own material.
          </p>

          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            Upload notes
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </button>
      </div>

      {/* Features row */}
      <div className="flex flex-wrap justify-center gap-6 mt-14 text-slate-500 text-sm">
        {['LangGraph Workflows', 'Grok AI', 'PDF Processing', 'Instant Feedback'].map(feat => (
          <span key={feat} className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feat}
          </span>
        ))}
      </div>
    </div>
  )
}
