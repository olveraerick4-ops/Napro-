import { useSyncExternalStore } from 'react'
import type { AppData, DayEntry, Settings } from '../types'

const KEY = 'aurora.v1'
const empty = (): AppData => ({ settings: { onboarded: false, method: 'creighton', country: 'ES', stage: 'regular' }, entries: {} })

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const d = JSON.parse(raw) as AppData
      return { settings: { ...empty().settings, ...d.settings }, entries: d.entries ?? {} }
    }
  } catch {
    /* datos corruptos o almacenamiento bloqueado */
  }
  return empty()
}

let state = load()
const subs = new Set<() => void>()
function commit(next: AppData) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* sin almacenamiento: sigue en memoria */
  }
  subs.forEach((f) => f())
}

export const useData = () =>
  useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => state,
  )

export const getData = () => state
export const setSettings = (p: Partial<Settings>) => commit({ ...state, settings: { ...state.settings, ...p } })
export const saveEntry = (e: DayEntry) => commit({ ...state, entries: { ...state.entries, [e.date]: e } })
export const deleteEntry = (date: string) => {
  const entries = { ...state.entries }
  delete entries[date]
  commit({ ...state, entries })
}
export const replaceAll = (d: AppData) => commit(d)
export const resetAll = () => commit(empty())

export function isValidBackup(x: unknown): x is AppData {
  const d = x as AppData
  return !!d && typeof d === 'object' && !!d.settings && typeof d.settings.method === 'string' && !!d.entries && typeof d.entries === 'object'
}
