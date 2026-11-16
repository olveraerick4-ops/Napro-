import { describe, expect, it } from 'vitest'
import type { AppData, DayEntry } from '../types'
import { buildCycles, detectShift, stats } from './engine'
import { crCode } from './methods'
import { addDays } from './dates'
import { demoData } from '../data/demo'

const mk = (method: AppData['settings']['method'], rows: Partial<DayEntry>[], start = '2026-01-01'): AppData => ({
  settings: { onboarded: true, method, country: 'ES' },
  entries: Object.fromEntries(rows.map((r, i) => [addDays(start, i), { ...r, date: addDays(start, i) }])),
})
const dry = { cr: { base: '0' as const, mods: [] } }
const np = { cr: { base: '6' as const, mods: ['C' as const] } }
const pk = { cr: { base: '10' as const, mods: ['K' as const, 'L' as const] } }

describe('Creighton', () => {
  it('código del registro', () => {
    expect(crCode({ date: 'x', cr: { base: '10', mods: ['L', 'K'], freq: 'AD' } })).toBe('10KL AD')
    expect(crCode({ date: 'x', cr: { base: '6', mods: ['C', 'P'], freq: 'X2' } })).toBe('6PC X2')
    expect(crCode({ date: 'x', bleeding: 'L', cr: { base: '0', mods: [], freq: 'AD' } })).toBe('L 0 AD')
  })
  it('día Pico, cuenta de 3 y estampas', () => {
    const d = mk('creighton', [{ bleeding: 'H', periodStart: true }, { bleeding: 'M' }, dry, np, pk, pk, dry, dry, np, dry, dry])
    const c = buildCycles(d, '2026-01-11')[0]
    expect(c.peakIdx).toBe(5)
    expect(c.days.map((x) => x.mark)).toEqual(['', '', '', '', '', 'P', '1', '2', '3', '', ''])
    expect(c.days.map((x) => x.stamp)).toEqual(['red', 'red', 'green', 'white-baby', 'white-baby', 'white-baby', 'green-baby', 'green-baby', 'white-baby', 'green', 'green'])
    expect(c.days[2].fertility).toBe('infertil')
    expect(c.days[7].fertility).toBe('fertil')
    expect(c.days[9].fertility).toBe('infertil')
  })
  it('no marca Pico hasta ver el día siguiente', () => {
    const c = buildCycles(mk('creighton', [{ bleeding: 'M', periodStart: true }, dry, pk]), '2026-01-03')[0]
    expect(c.peakIdx).toBeNull()
  })
  it('3 días de moco no-Pico antes del Pico: cuenta de 3', () => {
    const c = buildCycles(mk('creighton', [{ bleeding: 'M', periodStart: true }, np, np, np, dry, dry, dry, dry]), '2026-01-08')[0]
    expect(c.days.map((x) => x.mark)).toEqual(['', '', '', '', '1', '2', '3', ''])
    expect(c.days[7].stamp).toBe('green')
  })
  it('6 u 8 con K o L es tipo Pico', () => {
    const c = buildCycles(mk('creighton', [{ bleeding: 'M', periodStart: true }, { cr: { base: '8', mods: ['K'] } }, dry]), '2026-01-03')[0]
    expect(c.peakIdx).toBe(1)
  })
})

describe('temperatura', () => {
  const t = (arr: number[]) => arr.map((temp) => ({ entry: { date: '', temp } }))
  it('regla 3 sobre 6', () => {
    const s = detectShift(t([36.4, 36.3, 36.4, 36.35, 36.4, 36.3, 36.45, 36.6, 36.65, 36.7]))
    expect(s).toMatchObject({ firstHigh: 6, confirmed: 8 })
    expect(s!.coverLine).toBe(36.4)
  })
  it('sin subida suficiente no confirma', () => {
    expect(detectShift(t([36.4, 36.3, 36.4, 36.35, 36.4, 36.3, 36.45, 36.5, 36.5]))).toBeNull()
  })
  it('ignora mediciones alteradas', () => {
    const d = t([36.4, 36.3, 36.4, 36.35, 36.4, 36.3, 37.2, 36.5, 36.6, 36.7]) as { entry: DayEntry }[]
    d[6].entry.tempDisturbed = true
    expect(detectShift(d)).toMatchObject({ firstHigh: 7, confirmed: 9 })
  })
})

describe('ciclos y estadísticas', () => {
  it('datos de ejemplo: 2 ciclos completos + 1 en curso', () => {
    const d = demoData(mk('creighton', []))
    const cy = buildCycles(d)
    expect(cy.map((c) => c.length)).toEqual([28, 30, 17])
    expect(cy.map((c) => c.peakIdx! + 1)).toEqual([15, 16, 14])
    const s = stats(cy)
    expect(s).toMatchObject({ completed: 2, avg: 29, shortest: 28, longest: 30, avgPostPeak: 13.5 })
    const st = buildCycles({ ...d, settings: { ...d.settings, method: 'sintotermico' } })
    expect(st[0].shift).not.toBeNull()
  })
  it('calendario: ventana corto−18 a largo−11', () => {
    const d = demoData(mk('calendario', []))
    const cy = buildCycles(d)
    expect(cy[2].calendarWindow).toEqual([10, 19])
  })
})
