import { useEffect, useRef } from 'react'

// Emoji categories for the picker
const CATEGORIES = [
  {
    label: 'Smileys',
    emojis: ['😀','😃','😄','😁','😅','😂','🤣','😊','😇','🙂','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓'],
  },
  {
    label: 'Gestures',
    emojis: ['👍','👎','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','☝️','👇','✋','🤚','🖐','🖖','👋','🤙','💪','🦾','🖕','✍️','🙏','🫶','👏','🙌','🤝','🫱'],
  },
  {
    label: 'Hearts',
    emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','❤️‍🔥','❤️‍🩹','🫀'],
  },
  {
    label: 'Objects',
    emojis: ['🔥','⭐','✨','💫','🌟','💥','🎉','🎊','🎈','🎁','🏆','🥇','🎯','🎮','🎲','🃏','🎴','🀄','🎭','🎨','🖼','🎬','🎤','🎧','🎵','🎶','🎷','🎸','🎹','🎺'],
  },
  {
    label: 'Nature',
    emojis: ['🌈','☀️','🌤','⛅','🌥','☁️','🌦','🌧','⛈','🌩','🌨','❄️','☃️','⛄','🌬','💨','💧','💦','🌊','🌀','🌁','🌫','🌵','🌴','🌳','🌲','🌱','🌿','☘️','🍀','🎋','🍃'],
  },
  {
    label: 'Food',
    emojis: ['🍎','🍊','🍋','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶','🫑','🧄','🧅','🥔','🍠','🫘','🌽','🍕','🍔','🌭','🍟','🌮','🌯','🫔','🥙','🧆','🍳','🥚','🧇','🥞'],
  },
]

export default function EmojiPickerPopup({ onSelect, onClose }) {
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="w-72 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
      style={{ boxShadow: '0 8px 32px rgba(91,79,233,0.15)' }}
    >
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Emoji</p>
      </div>

      {/* Scrollable emoji grid */}
      <div className="overflow-y-auto max-h-60 p-2">
        {CATEGORIES.map(({ label, emojis }) => (
          <div key={label} className="mb-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-1.5">{label}</p>
            <div className="grid grid-cols-8 gap-0.5">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => onSelect(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-violet-50 rounded-lg transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
