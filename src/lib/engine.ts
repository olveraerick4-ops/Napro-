import type { AppData, DayEntry, MethodId } from '../types'
import { addDays, diffDays, today } from './dates'
import { methodDef } from './methods'
import { stageDef } from './stages'

export type DayClass = 'none' | 'bleed' | 'dry' | 'nonpeak' | 'peak'
export type StampKind = 'empty' | 'red' | 'green' | 'white-baby' | 'green-baby' | 'yellow' | 'plain'
export type Fertility = 'fertil' | 'infertil' | 'desconocido'

export interface DayInfo {
  date: string
  cd: number // día del ciclo (1…)
  entry?: DayEntry
  cls: DayClass
  stamp: StampKind
  /** 'P' o '1' | '2' | '3' */
  mark: string
  fertility: Fertility
  reason: string
}

export interface TempShift {
  coverLine: number
  /** índice (en days) de la primera temperatura alta */
  firstHigh: number
  /** índice del día en que queda confirmada la subida */
  confirmed: number
}

export interface Cycle {
  index: number // 1 = más antiguo
  start: string
  /** true si el inicio es una regla marcada (no un registro que empieza a mitad de ciclo) */
  hasStart: boolean
  complete: boolean
  length: number
  days: DayInfo[]
  peakIdx: number | null
  shift: TempShift | null
  /** días desde el Pico (o subida) hasta el final del ciclo; solo ciclos completos */
  postPeak: number | null
  /** ventana fértil estimada por calendario [desde, hasta] en día del ciclo */
  calendarWindow: [number, number] | null
}

// ---------- clasificación del día ----------
export function classify(e: DayEntry | undefined, method: MethodId, yellowOn = false): DayClass {
  if (!e) return 'none'
  const kind = methodDef(method).usesMucus
  // estampa amarilla: flujo que la instructora identificó como no fértil, cuenta como seco
  if (yellowOn && kind && e.yellow && e.bleeding !== 'H' && e.bleeding !== 'M') return 'dry'
  if (kind === 'creighton' && e.cr) {
    const b = e.cr.base
    if (b === '0' || b === '2' || b === '2W' || b === '4') return e.bleeding === 'H' || e.bleeding === 'M' ? 'bleed' : 'dry'
    if (b.startsWith('10')) return 'peak'
    return e.cr.mods.some((m) => m === 'K' || m === 'C/K' || m === 'L') ? 'peak' : 'nonpeak'
  }
  if (kind === 'simple' && e.mucus) {
    const { sensation, appearance } = e.mucus
    if (sensation === 'resbalosa' || appearance === 'claro') return 'peak'
    if (sensation === 'seca' && appearance === 'nada') return e.bleeding === 'H' || e.bleeding === 'M' ? 'bleed' : 'dry'
    return 'nonpeak'
  }
  if (e.bleeding) return 'bleed'
  return 'none'
}

// ---------- subida de temperatura: regla «3 sobre 6» ----------
export function detectShift(days: { entry?: DayEntry }[]): TempShift | null {
  const valid = days
    .map((d, i) => ({ i, t: d.entry?.temp, bad: d.entry?.tempDisturbed }))
    .filter((x): x is { i: number; t: number; bad: boolean | undefined } => x.t != null && !x.bad)
  const r = (n: number) => Math.round(n * 100) / 100
  for (let k = 6; k + 2 < valid.length; k++) {
    const cover = Math.max(...valid.slice(k - 6, k).map((x) => x.t))
    const [a, b, c] = [valid[k], valid[k + 1], valid[k + 2]]
    if (!(a.t > cover && b.t > cover && c.t > cover)) continue
    if (r(c.t - cover) >= 0.2) return { coverLine: cover, firstHigh: a.i, confirmed: c.i }
    // excepción: si la 3.ª no llega a +0,2 °C, basta una 4.ª por encima de la línea
    const d = valid[k + 3]
    if (d && d.t > cover) return { coverLine: cover, firstHigh: a.i, confirmed: d.i }
  }
  return null
}

// ---------- ciclos ----------
export function buildCycles(data: AppData, now: string = today()): Cycle[] {
  const method = data.settings.method
  const dates = Object.keys(data.entries).sort()
  if (!dates.length) return []
  const starts = dates.filter((d) => data.entries[d].periodStart)
  const bounds: { start: string; hasStart: boolean }[] = starts.map((s) => ({ start: s, hasStart: true }))
  if (!starts.length || dates[0] < starts[0]) bounds.unshift({ start: dates[0], hasStart: false })

  const last = dates[dates.length - 1] > now ? dates[dates.length - 1] : now
  const cycles: Cycle[] = bounds.map((b, i) => {
    const next = bounds[i + 1]?.start
    const end = next ? addDays(next, -1) : last
    const length = Math.min(diffDays(b.start, end) + 1, 120)
    const days: DayInfo[] = []
    for (let n = 0; n < length; n++) {
      const date = addDays(b.start, n)
      const entry = data.entries[date]
      days.push({ date, cd: n + 1, entry, cls: classify(entry, method, !!data.settings.yellowStamps), stamp: 'empty', mark: '', fertility: 'desconocido', reason: '' })
    }
    return {
      index: i + 1,
      start: b.start,
      hasStart: b.hasStart,
      complete: !!next,
      length,
      days,
      peakIdx: null,
      shift: null,
      postPeak: null,
      calendarWindow: null,
    }
  })

  const lengths = cycles.filter((c) => c.complete && c.hasStart).map((c) => c.length)
  for (const c of cycles) interpret(c, data, lengths, now)
  return cycles
}

export function calendarWindow(data: AppData, lengths: number[]): { win: [number, number]; basis: string } {
  const s = data.settings
  const known = [...lengths]
  if (s.shortest) known.push(s.shortest)
  if (s.longest) known.push(s.longest)
  if (!known.length) return { win: [8, 19], basis: 'Sin historial todavía: se usa la ventana estándar (días 8 a 19), válida solo para ciclos de 26 a 32 días.' }
  const short = Math.min(...known)
  const long = Math.max(...known)
  return {
    win: [Math.max(1, short - 18), Math.max(short - 18, long - 11)],
    basis: `Calculada con tu ciclo más corto (${short} días) y más largo (${long} días): corto − 18 y largo − 11.`,
  }
}

function interpret(c: Cycle, data: AppData, lengths: number[], now: string) {
  const method = data.settings.method
  const def = methodDef(method)
  const d = c.days
  const n = d.length

  // --- Pico y cuentas de 3 (métodos de moco) ---
  const count: (number | 0)[] = new Array(n).fill(0)
  if (def.usesMucus) {
    const setCount = (from: number) => {
      for (let k = 1; k <= 3 && from + k < n; k++) {
        if (d[from + k].cls === 'peak') break
        count[from + k] = k
      }
    }
    let run = 0 // racha de moco no-Pico antes del Pico
    for (let i = 0; i < n; i++) {
      const cls = d[i].cls
      const nextCls = d[i + 1]?.cls
      if (cls === 'peak' && nextCls && nextCls !== 'peak' && nextCls !== 'none') {
        d[i].mark = 'P'
        c.peakIdx = i
        setCount(i)
      }
      if (cls === 'nonpeak') run++
      else {
        if (run >= 3 && c.peakIdx === null && cls !== 'peak' && cls !== 'none') {
          count[i] = Math.max(count[i], 1)
          for (let k = 1; k < 3 && i + k < n; k++) if (d[i + k].cls !== 'peak') count[i + k] = k + 1
        }
        run = 0
      }
    }
    for (let i = 0; i < n; i++) if (count[i] && !d[i].mark) d[i].mark = String(count[i])
  }

  // --- temperatura ---
  if (def.usesTemp) c.shift = detectShift(d)

  // --- calendario ---
  if (method === 'calendario') c.calendarWindow = calendarWindow(data, lengths).win

  // --- estampas + fertilidad ---
  for (let i = 0; i < n; i++) {
    const x = d[i]
    const bleeding = !!x.entry?.bleeding
    if (def.usesMucus) {
      const yellow = !!data.settings.yellowStamps && !!x.entry?.yellow && x.cls === 'dry'
      if (yellow) x.stamp = 'yellow'
      else if (bleeding) x.stamp = 'red'
      else if (x.cls === 'peak' || x.cls === 'nonpeak') x.stamp = 'white-baby'
      else if (x.cls === 'dry') x.stamp = count[i] ? 'green-baby' : 'green'
    } else {
      if (bleeding) x.stamp = 'red'
      else if (x.entry) x.stamp = 'plain'
    }

    if (method === 'creighton' || method === 'billings') {
      if (x.cls === 'none') set(x, 'desconocido', 'Sin registro. En caso de duda, considera el día como fértil.')
      else if (x.mark === 'P') set(x, 'fertil', 'Día Pico: último día de moco transparente, elástico o lubricante.')
      else if (x.cls === 'peak') set(x, 'fertil', 'Moco tipo Pico (transparente, elástico o lubricante).')
      else if (x.cls === 'nonpeak') set(x, 'fertil', 'Día con moco: se considera fértil.')
      else if (x.stamp === 'yellow' && !count[i]) set(x, 'infertil', 'Estampa amarilla: flujo que tu instructora identificó como no fértil (al final del día).')
      else if (count[i]) set(x, 'fertil', `Cuenta de 3: día ${count[i]}. La fertilidad continúa hasta completar tres días.`)
      else if (x.cls === 'bleed' || bleeding) set(x, 'fertil', 'Los días de sangrado se consideran fértiles en las instrucciones básicas.')
      else set(x, 'infertil', c.peakIdx !== null && i > c.peakIdx ? 'Día seco después del Pico + 3.' : 'Día seco antes del Pico (al final del día).')
    } else if (method === 'sintotermico' || method === 'temperatura') {
      const peakOk = method === 'temperatura' || (c.peakIdx !== null && i >= c.peakIdx + 3)
      if (c.shift && i >= c.shift.confirmed && peakOk)
        set(x, 'infertil', method === 'temperatura' ? 'Subida de temperatura confirmada (3 sobre 6).' : 'Subida de temperatura confirmada y Pico + 3 cumplido.')
      else if (c.shift && i >= c.shift.confirmed) set(x, 'fertil', 'La temperatura ya subió, pero falta completar los 3 días tras el Pico del moco.')
      else if (method === 'sintotermico' && i < 5 && !d.slice(0, i + 1).some((y) => y.cls === 'peak' || y.cls === 'nonpeak'))
        set(x, 'infertil', 'Primeros 5 días del ciclo sin moco (regla de inicio; requiere historial de ciclos).')
      else set(x, method === 'temperatura' ? 'desconocido' : 'fertil', method === 'temperatura'
        ? 'Aún no se ha confirmado la subida de temperatura: la temperatura sola no anticipa la ovulación.'
        : 'Fase potencialmente fértil: aún no se confirma la subida de temperatura.')
    } else {
      const [a, b] = c.calendarWindow!
      if (!c.hasStart) set(x, 'desconocido', 'Marca el primer día de tu regla para empezar a contar.')
      else if (x.cd >= a && x.cd <= b) set(x, 'fertil', `Dentro de la ventana fértil estimada (días ${a} a ${b}).`)
      else set(x, 'infertil', `Fuera de la ventana fértil estimada (días ${a} a ${b}).`)
    }
  }

  // --- ajustes según la etapa de vida ---
  const stage = data.settings.stage
  const sd = stageDef(stage)
  const since = data.settings.stageSince
  for (let i = 0; i < n; i++) {
    const x = d[i]
    if (sd.noFertility) {
      set(x, 'desconocido', stage === 'embarazo' ? 'Durante el embarazo no se calculan días fértiles.' : 'Tras la menopausia no se calculan días fértiles.')
      continue
    }
    if (stage === 'lactancia-total' && since && x.date >= since && diffDays(since, x.date) < 56 && x.entry) {
      set(x, 'infertil', `Lactancia total: primeras 8 semanas tras el parto (día ${diffDays(since, x.date) + 1} de 56).`)
      continue
    }
    if ((stage === 'lactancia-parcial' || stage === 'posparto') && since && x.date >= since && diffDays(since, x.date) < 56 && x.fertility === 'infertil') {
      x.reason += stage === 'posparto' ? ' Sin lactancia la ovulación puede volver desde el día 27 tras el parto: sé muy constante con las observaciones.' : ' En lactancia parcial estas semanas no se consideran infértiles por sí mismas.'
    }
    if (stage === 'buscando' && def.usesMucus && c.peakIdx !== null && i >= c.peakIdx && i <= c.peakIdx + 2 && x.entry) {
      set(x, 'fertil', i === c.peakIdx ? 'Día Pico: de los días de mayor fertilidad. Buen momento si buscáis embarazo.' : 'Uno de los dos días después del Pico: todavía muy fértil.')
    } else if (stage === 'buscando' && x.cls === 'peak' && x.mark !== 'P') {
      set(x, 'fertil', 'Moco tipo Pico: de los días de mayor fertilidad. Buen momento si buscáis embarazo.')
    }
  }

  // --- fase post-Pico ---
  const ref = c.peakIdx ?? (c.shift ? c.shift.firstHigh - 1 : null)
  if (c.complete && ref !== null) c.postPeak = n - 1 - ref
  void now
}

function set(x: DayInfo, f: Fertility, reason: string) {
  x.fertility = f
  x.reason = reason
}

// ---------- estadísticas ----------
export interface Stats {
  completed: number
  avg: number | null
  shortest: number | null
  longest: number | null
  avgPeak: number | null
  avgPostPeak: number | null
  avgBleed: number | null
  nextPeriod: string | null
}

export function stats(cycles: Cycle[]): Stats {
  const done = cycles.filter((c) => c.complete && c.hasStart)
  const mean = (a: number[]) => (a.length ? Math.round((a.reduce((x, y) => x + y, 0) / a.length) * 10) / 10 : null)
  const lens = done.map((c) => c.length)
  const peaks = cycles.filter((c) => c.hasStart && c.peakIdx !== null).map((c) => c.peakIdx! + 1)
  const post = done.filter((c) => c.postPeak !== null).map((c) => c.postPeak!)
  const bleed = cycles
    .filter((c) => c.hasStart)
    .map((c) => {
      let k = 0
      while (k < c.days.length && c.days[k].entry?.bleeding) k++
      return k
    })
    .filter((k) => k > 0)
  const avg = mean(lens)
  const cur = cycles[cycles.length - 1]
  return {
    completed: done.length,
    avg,
    shortest: lens.length ? Math.min(...lens) : null,
    longest: lens.length ? Math.max(...lens) : null,
    avgPeak: mean(peaks),
    avgPostPeak: mean(post),
    avgBleed: mean(bleed),
    nextPeriod: avg && cur?.hasStart && !cur.complete ? addDays(cur.start, Math.round(avg)) : null,
  }
}
