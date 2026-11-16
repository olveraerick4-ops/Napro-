import type { AppData, CrBase, CrMod, DayEntry, Sensation, Appearance } from '../types'
import { addDays, today } from '../lib/dates'

type Row = [bleed: DayEntry['bleeding'] | '', base: CrBase | '', mods: string, freq: string]

// Ciclos de ejemplo (ficticios) al estilo de una gráfica Creighton
const patterns: Row[][] = [28, 30, 27].map((len, c) => {
  const peak = len - 13 - (c === 1 ? 1 : 0)
  const rows: Row[] = []
  for (let d = 1; d <= len; d++) {
    if (d === 1) rows.push(['M', '', '', ''])
    else if (d <= 3) rows.push(['H', '', '', ''])
    else if (d === 4) rows.push(['M', '', '', ''])
    else if (d === 5) rows.push(['L', '0', '', 'AD'])
    else if (d === 6) rows.push(['VL', '0', '', 'AD'])
    else if (d < peak - 5) rows.push(['', d % 3 === 0 ? '2' : '0', '', 'AD'])
    else if (d === peak - 5) rows.push(['', '6', 'C', 'X1'])
    else if (d === peak - 4) rows.push(['', '6', 'PC', 'X2'])
    else if (d === peak - 3) rows.push(['', '8', 'C', 'X2'])
    else if (d === peak - 2) rows.push(['', '8', 'CK', 'X3'])
    else if (d === peak - 1) rows.push(['', '10', 'K', 'AD'])
    else if (d === peak) rows.push(['', '10', 'KL', 'AD'])
    else if (d === peak + 1) rows.push(['', '6', 'C', 'X1'])
    else if (d === peak + 6 && c === 0) rows.push(['', '6', 'PC', 'X1'])
    else rows.push(['', d % 4 === 0 ? '4' : '0', '', 'AD'])
  }
  return rows
})

const parseMods = (s: string): CrMod[] => {
  const out: CrMod[] = []
  if (s.includes('CK')) out.push('C/K')
  else if (s.includes('C')) out.push('C')
  for (const m of ['P', 'G', 'K', 'L', 'Y'] as CrMod[]) if (s.replace('CK', '').includes(m)) out.push(m)
  return out
}

export function demoData(base: AppData): AppData {
  const current = patterns[2].slice(0, 17)
  const all = [patterns[0], patterns[1], current]
  const total = all.reduce((n, p) => n + p.length, 0)
  let date = addDays(today(), -(total - 1))
  const entries: Record<string, DayEntry> = {}
  all.forEach((rows, ci) => {
    const peakDay = rows.findIndex((r) => r[2] === 'KL') + 1 || 99
    rows.forEach(([bleed, crBase, mods, freq], i) => {
      const cd = i + 1
      const e: DayEntry = { date }
      if (bleed) e.bleeding = bleed
      if (cd === 1) e.periodStart = true
      if (crBase) {
        e.cr = { base: crBase, mods: parseMods(mods), freq: (freq || undefined) as never }
        const m = parseMods(mods)
        const sensation: Sensation = crBase === '0' ? 'seca' : m.includes('L') ? 'resbalosa' : crBase === '10' ? 'mojada' : 'humeda'
        const appearance: Appearance = ['0', '2', '4'].includes(crBase) ? 'nada' : m.includes('K') || m.includes('C/K') ? 'claro' : 'espeso'
        e.mucus = { sensation, appearance }
      }
      // temperatura basal: baja antes de la ovulación, alta después
      const wobble = ((cd * 37 + ci * 11) % 9) * 0.02 - 0.08
      e.temp = Math.round(((cd > peakDay + 1 ? 36.72 : cd === peakDay + 1 ? 36.55 : 36.38) + wobble) * 20) / 20
      if (ci === 0 && cd === 9) {
        e.temp = 36.9
        e.tempDisturbed = true
        e.notes = 'Dormí mal'
      }
      if ((cd === peakDay + 5 || cd === peakDay + 8) && !bleed) e.intercourse = true
      entries[date] = e
      date = addDays(date, 1)
    })
  })
  return { settings: { ...base.settings, onboarded: true }, entries }
}
