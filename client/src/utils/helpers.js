import { clsx } from 'clsx'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'

// ── Class merging ──────────────────────────────────────────
export function cn(...inputs) {
  return clsx(inputs)
}

// ── Date formatting ────────────────────────────────────────

/** Returns "Just now", "5 minutes ago", "Yesterday", or a formatted date */
export function formatMessageTime(date) {
  const d = new Date(date)
  const diffMs = Date.now() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (isToday(d)) return format(d, 'h:mm a')
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

/** Returns a full timestamp for tooltips */
export function formatFullDate(date) {
  return format(new Date(date), 'PPp') // e.g. "Apr 11, 2026, 2:30 PM"
}

/** Relative time string: "2 hours ago" */
export function timeAgo(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// ── String utilities ───────────────────────────────────────

/** Truncate string with ellipsis */
export function truncate(str, length = 60) {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '…' : str
}

/** Capitalize first letter */
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/** Get initials from a name */
export function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

// ── Error message extraction ───────────────────────────────

/** Safely extract error message from axios error */
export function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong. Please try again.'
  )
}

// ── Priority helpers ───────────────────────────────────────

export const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20'    },
  medium: { label: 'Medium', color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
  low:    { label: 'Low',    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
}

export const STATUS_CONFIG = {
  todo:        { label: 'To Do',       color: 'text-gray-400',   bg: 'bg-gray-500/10'   },
  in_progress: { label: 'In Progress', color: 'text-brand-400',  bg: 'bg-brand-500/10'  },
  done:        { label: 'Done',        color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
}
