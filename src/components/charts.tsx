import { useState } from 'react'
import type { Cycle } from '../lib/engine'
import { fmtShort } from '../lib/dates'

export const CELL = 46

/** Curva de temperatura basal alineada con las columnas de la gráfica */
export function TempChart({ cycle }: { cycle: Cycle }) {
  const [active, setActive] = useState<number | null>(null)
  const pts = cycle.days.map((d, i) => ({ i, t: d.entry?.temp, bad: !!d.entry?.tempDisturbed, date: d.date })).filter((p) => p.t != null) as {
    i: number
    t: number
    bad: boolean
    date: string
  }[]
  const H = 150
  const padT = 14
  const padB = 10
  const W = cycle.days.length * CELL
  if (!pts.length) return <div className="temp-empty" style={{ width: W }}>Sin temperaturas en este ciclo</div>
  const lo = Math.min(36.1, ...pts.map((p) => p.t)) - 0.1
  const hi = Math.max(36.9, ...pts.map((p) => p.t)) + 0.1
  const x = (i: number) => i * CELL + CELL / 2
  const y = (t: number) => padT + (1 - (t - lo) / (hi - lo)) * (H - padT - padB)
  const ticks: number[] = []
  for (let t = Math.ceil(lo * 5) / 5; t <= hi; t = Math.round((t + 0.2) * 10) / 10) ticks.push(t)
  const good = pts.filter((p) => !p.bad)
  const path = good.map((p, k) => `${k ? 'L' : 'M'}${x(p.i)} ${y(p.t)}`).join(' ')
  const s = cycle.shift
  const a = active != null ? pts.find((p) => p.i === active) : null

  return (
    <svg className="temp-chart" width={W} height={H} role="img" aria-label="Curva de temperatura basal del ciclo">
      {ticks.map((t) => (
        <g key={t}>
          <line x1="0" x2={W} y1={y(t)} y2={y(t)} className="grid" />
          <text x="4" y={y(t) - 3} className="tick">
            {t.toFixed(1).replace('.', ',')}
          </text>
        </g>
      ))}
      {s && (
        <g>
          <line x1="0" x2={W} y1={y(s.coverLine)} y2={y(s.coverLine)} className="cover" />
          <text x={W - 6} y={y(s.coverLine) - 5} textAnchor="end" className="cover-label">
            Línea base {s.coverLine.toFixed(2).replace('.', ',')} °C
          </text>
        </g>
      )}
      <path d={path} className="temp-line" />
      {pts.map((p) => (
        <g key={p.i} onPointerEnter={() => setActive(p.i)} onPointerLeave={() => setActive(null)} onClick={() => setActive(p.i)}>
          <rect x={x(p.i) - CELL / 2} y="0" width={CELL} height={H} fill="transparent" />
          <circle
            cx={x(p.i)}
            cy={y(p.t)}
            r={active === p.i ? 6 : 4.5}
            className={'temp-dot' + (p.bad ? ' bad' : s && p.i >= s.firstHigh ? ' high' : '')}
          />
        </g>
      ))}
      {a && (
        <g pointerEvents="none" transform={`translate(${Math.min(Math.max(x(a.i), 62), W - 62)} ${Math.max(y(a.t) - 14, 24)})`}>
          <rect x="-58" y="-20" width="116" height="22" rx="6" className="tip-bg" />
          <text textAnchor="middle" y="-5" className="tip-text">
            {fmtShort(a.date)} · {a.t.toFixed(2).replace('.', ',')} °C{a.bad ? ' (alt.)' : ''}
          </text>
        </g>
      )}
    </svg>
  )
}

/** Barras: duración de cada ciclo completo */
export function CycleBars({ cycles, avg }: { cycles: Cycle[]; avg: number | null }) {
  const [active, setActive] = useState<number | null>(null)
  const done = cycles.filter((c) => c.complete && c.hasStart).slice(-12)
  if (!done.length) return <p className="muted">Cuando completes tu primer ciclo verás aquí su duración.</p>
  const W = 320
  const H = 170
  const padL = 26
  const padB = 22
  const padT = 16
  const max = Math.max(35, ...done.map((c) => c.length)) + 2
  const y = (v: number) => padT + (1 - v / max) * (H - padT - padB)
  const slot = (W - padL) / done.length
  const bw = Math.min(24, slot - 2)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="bars" role="img" aria-label="Duración de los ciclos en días">
      {[10, 20, 30].map((t) => (
        <g key={t}>
          <line x1={padL} x2={W} y1={y(t)} y2={y(t)} className="grid" />
          <text x={padL - 5} y={y(t) + 3.5} textAnchor="end" className="tick">
            {t}
          </text>
        </g>
      ))}
      <line x1={padL} x2={W} y1={y(0)} y2={y(0)} className="axis" />
      {done.map((c, k) => {
        const cx = padL + slot * k + slot / 2
        const top = y(c.length)
        return (
          <g key={c.index} onPointerEnter={() => setActive(k)} onPointerLeave={() => setActive(null)} onClick={() => setActive(k)}>
            <rect x={cx - slot / 2} y={padT} width={slot} height={H - padT - padB} fill="transparent" />
            <path d={`M${cx - bw / 2} ${y(0)}V${top + 4}q0-4 4-4h${bw - 8}q4 0 4 4V${y(0)}z`} className={'bar' + (active === k ? ' on' : '')} />
            <text x={cx} y={H - 7} textAnchor="middle" className="tick">
              {c.index}
            </text>
            {(active === k || done.length <= 6) && (
              <text x={cx} y={top - 5} textAnchor="middle" className="bar-val">
                {c.length}
              </text>
            )}
          </g>
        )
      })}
      {avg != null && done.length > 1 && (
        <g pointerEvents="none">
          <line x1={padL} x2={W} y1={y(avg)} y2={y(avg)} className="cover" />
        </g>
      )}
    </svg>
  )
}
