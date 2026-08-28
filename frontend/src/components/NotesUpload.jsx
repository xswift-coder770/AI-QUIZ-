import { useState, useRef } from 'react'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

export default function NotesUpload({ onStart, onBack, error }) {
  const [file, setFile] = useState(null)
  const [difficulty, setDifficulty] = useState('Medium')
  const [numQuestions, setNumQuestions] = useState(5)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef()

  const handleFile = (f) => {
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a valid PDF file.')
      return
    }
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    handleFile(dropped)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    await onStart({ file, difficulty, number_of_questions: numQuestions })
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">My Notes</h1>
            <p className="text-slate-400 text-sm">Upload your PDF and generate a personalized quiz</p>
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

      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
        {/* Drop Zone */}
        <div>
          <label className="field-label">Upload Your Study Notes</label>
          <div
            id="pdf-drop-zone"
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
              ${dragOver
                ? 'border-emerald-500 bg-emerald-500/10'
                : file
                  ? 'border-emerald-500/60 bg-emerald-500/5'
                  : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/40'
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />

            {file ? (
              /* File selected state */
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-emerald-300 font-semibold">{file.name}</p>
                  <p className="text-slate-500 text-sm mt-1">
                    {(file.size / 1024).toFixed(1)} KB · Click to change
                  </p>
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-slate-700/60 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-300 font-semibold">Drag & Drop your PDF</p>
                  <p className="text-slate-500 text-sm mt-1">or <span className="text-brand-400 underline">browse files</span></p>
                </div>
                <p className="text-slate-600 text-xs">PDF only · Max 10 MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="field-label">Difficulty</label>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                type="button"
                id={`notes-difficulty-${d.toLowerCase()}`}
                onClick={() => setDifficulty(d)}
                className={`py-2.5 rounded-xl border-2 font-semibold text-sm transition-all duration-200
                  ${difficulty === d
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
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
          <label className="field-label" htmlFor="notes-num-questions">
            Number of Questions
            <span className="ml-2 text-emerald-400 font-semibold">{numQuestions}</span>
          </label>
          <input
            id="notes-num-questions"
            type="range"
            min={3}
            max={15}
            value={numQuestions}
            onChange={e => setNumQuestions(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                       accent-emerald-500 mt-2"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>3</span>
            <span>15</span>
          </div>
        </div>

        {/* Submit */}
        <button
          id="btn-generate-notes-quiz"
          type="submit"
          disabled={loading || !file}
          className="w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 active:scale-95
                     bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/25
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {loading ? 'Processing...' : 'Generate Quiz →'}
        </button>
      </form>
    </div>
  )
}
