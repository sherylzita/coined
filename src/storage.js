import { dateKey, shiftDateKey } from './daily.js'

const KEY = 'coined-v1'

const empty = { lastDate: null, streak: 0, impressions: {} }

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty
    const data = JSON.parse(raw)
    return {
      lastDate: data.lastDate ?? null,
      streak: Number.isFinite(data.streak) ? data.streak : 0,
      impressions: data.impressions && typeof data.impressions === 'object' ? data.impressions : {},
    }
  } catch {
    return empty
  }
}

export function recordImpression(prev, today, ids) {
  let streak = prev.streak || 0
  if (prev.lastDate !== today) {
    streak = prev.lastDate === shiftDateKey(today, -1) ? streak + 1 : 1
  } else if (!prev.lastDate) {
    streak = 1
  }

  const next = {
    lastDate: today,
    streak,
    impressions: { ...prev.impressions, [today]: { ids } },
  }

  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* private mode and full disks still get the in-session coin */
  }

  return next
}

export function todayKey() {
  return dateKey(new Date())
}
