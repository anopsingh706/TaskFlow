import Logo from './Logo'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <Logo size="lg" />
          <div className="absolute -inset-3 border-2 border-violet-100 rounded-2xl animate-ping opacity-60" />
        </div>
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 bg-violet-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
