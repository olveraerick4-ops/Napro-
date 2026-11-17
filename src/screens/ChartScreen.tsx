import { useEffect, useRef } from 'react'
import type { Cycle, StampKind } from '../lib/engine'
import { fmtDM, fmtShort, today } from '../lib/dates'
import { codeFor, methodDef } from '../lib/methods'
import { useData } from '../lib/store'
import { STAMP_COLORS, Stamp } from '../components/art'
import { CELL, TempChart } from '../components/charts'

export function ChartScreen({ cycles, onEdit }: { cycles: Cycle[]; onEdit: (d: string) => void }) {
  const data = useData()
  const method = data.settings.method
  const def = methodDef(method)
  const now = today()
  const lastRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // lleva la vista al día de hoy en el ciclo actual
    const el = lastRef.current
    const cur = cycles[cycles.length - 1]
    if (el && cur) el.scrollLeft = Math.max(0, (cur.days.findIndex((d) => d.date === now) - 4) * CELL)
  }, [cycles.length]) // eslint-disable-line

  const legend: StampKind[] = def.usesMucus
    ? ['red', 'green', 'white-baby', 'green-baby', ...(data.settings.yellowStamps ? (['yellow'] as const) : [])]
    : ['red', 'plain']

  return (
    <>
      <header className="top">
        <div>
          <div className="eyebrow">{def.name}</div>
          <h1>Gráfica</h1>
        </div>
      </header>

      {!cycles.length && (
        <section className="card">
          <p className="muted">Todavía no hay registros. Empieza desde la pestaña «Hoy».</p>
        </section>
      )}

      {[...cycles].reverse().map((c, k) => (
        <section className="card chart-card" key={c.start}>
          <div className="chart-title">
            <h2>{c.hasStart ? `Ciclo ${c.index}` : 'Antes del primer ciclo'}</h2>
            <span className="muted">
              {fmtShort(c.start)} · {c.complete ? `${c.length} días` : 'en curso'}
              {c.peakIdx !== null && def.usesMucus ? ` · Pico día ${c.peakIdx + 1}` : ''}
            </span>
          </div>
          <div className="chart-scroll" ref={k === 0 ? lastRef : undefined}>
            {def.usesTemp && <TempChart cycle={c} />}
            <div className="chart-row" style={{ width: c.days.length * CELL }}>
              {c.days.map((d) => (
                <button key={d.date} className={'cell' + (d.date === now ? ' today' : '')} style={{ width: CELL }} onClick={() => onEdit(d.date)} aria-label={`Día ${d.cd}, ${fmtShort(d.date)}`}>
                  <span className="cell-n">{d.cd}</span>
                  <Stamp kind={d.stamp} mark={d.mark} size={34} />
                  <span className="cell-code">{d.entry ? codeFor(d.entry, method) : ''}</span>
                  {d.entry?.intercourse && <span className="cell-i">I</span>}
                  <span className="cell-date">{fmtDM(d.date)}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      ))}

      {!!cycles.length && (
        <section className="card">
          <h2>Leyenda</h2>
          <ul className="legend">
            {legend.map((s) => (
              <li key={s}>
                <Stamp kind={s} size={22} /> {STAMP_COLORS[s].label}
              </li>
            ))}
            {def.usesMucus && (
              <li>
                <Stamp kind="white-baby" mark="P" size={22} /> P = día Pico · 1, 2, 3 = cuenta de tres días después
              </li>
            )}
          </ul>
          <p className="muted small">Toca cualquier día para registrarlo o corregirlo. Las estampas se calculan a partir de tus observaciones.</p>
        </section>
      )}
    </>
  )
}
