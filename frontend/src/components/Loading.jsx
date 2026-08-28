export default function Loading({ message }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      {/* Spinner */}
      <div className="relative mb-8">
        <div className="w-16 h-16 rounded-full border-4 border-slate-700"></div>
        <div className="w-16 h-16 rounded-full border-4 border-brand-500 border-t-transparent
                        absolute top-0 left-0 animate-spin"></div>
        {/* Inner glow dot */}
        <div className="w-4 h-4 bg-brand-500 rounded-full absolute top-1/2 left-1/2
                        -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
      </div>

      {/* Message */}
      <p className="text-slate-300 text-lg font-medium text-center animate-pulse-slow">
        {message || 'Loading...'}
      </p>
      <p className="text-slate-500 text-sm mt-2">This may take a few seconds</p>
    </div>
  )
}
