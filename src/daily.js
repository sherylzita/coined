export function dateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function shiftDateKey(key, days) {
  const [y, m, d] = key.split('-').map(Number)
  const next = new Date(y, m - 1, d)
  next.setDate(next.getDate() + days)
  return dateKey(next)
}

export function formatLongDate(date) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}
