export default function TypingIndicator({ users }) {
  if (!users.length) return null

  const names = users.map(u => u.name.split(' ')[0])
  const label = names.length === 1
    ? `${names[0]} is typing`
    : names.length === 2
    ? `${names[0]} and ${names[1]} are typing`
    : `${names[0]} and ${names.length - 1} others are typing`

  return (
    <div className="flex items-center gap-2.5 mt-3 ml-10">
      {/* Three bouncing dots */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400 italic">{label}…</span>
    </div>
  )
}
