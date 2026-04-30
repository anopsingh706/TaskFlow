// Generates a color from the user's name so initials always have a consistent color
const nameToColor = (name = '') => {
  const colors = [
    '#6C63FF', '#FF6B6B', '#43D9AD', '#FFB830',
    '#FF8C69', '#7B61FF', '#06B6D4', '#F59E0B',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const getInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

export default function Avatar({ user, size = 36, className = '' }) {
  const name  = user?.name || '?'
  const color = nameToColor(name)

  const style = {
    width: size,
    height: size,
    fontSize: size * 0.38,
    flexShrink: 0,
  }

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={name}
        style={style}
        className={`rounded-full object-cover ring-2 ring-white/10 ${className}`}
      />
    )
  }

  return (
    <div
      style={{ ...style, backgroundColor: color + '22', border: `1.5px solid ${color}40` }}
      className={`rounded-full flex items-center justify-center font-medium ${className}`}
    >
      <span style={{ color, lineHeight: 1 }}>{getInitials(name)}</span>
    </div>
  )
}
