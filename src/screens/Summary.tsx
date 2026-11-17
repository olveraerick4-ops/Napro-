import { useState } from 'react'
import type { Cycle } from '../lib/engine'
import { calendarWindow, stats } from '../lib/engine'
import { fmtShort, num } from '../lib/dates'
import { methodDef } from '../lib/methods'
import { useData } from '../lib/store'
import { CycleBars } from '../components/charts'
import { Icon } from '../components/art'
import { InsightList } from '../components/Insights'
import type { Insight } from '../lib/insights'
import type { Tab } from '../App'

export function Summary({ cycles, signals, onGo }: { cycles: Cycle[]; signals: Insight[]; onGo: (t: Tab) => void }) {
  const data = useData()
  const def = methodDef(data.settings.method)
  const s = stats(cycles)
  const [busy, setBusy] = useState<string | null>(null)
  const [err, setErr] = useState('')
  const hasData = cycles.length > 0

  const run = async (kind: 'excel' | 'pdf') => {
    setBusy(kind)
    setErr('')
    try {
      const m = await import('../lib/export')
      await (kind === 'excel' ? m.exportExcel(data, cycles, signals) : m.exportPdf(data, cycles, signals))
    } catch (e) {
      console.error(e)
      setErr('No se pudo generar el archivo. Inténtalo de nuevo.')
    }
    setBusy(null)
  }

  const tiles: [string, string, string][] = [
    ['Ciclos completos', String(s.completed), ''],
    ['Duración media', s.avg != null ? num(s.avg) : '—', 'días'],
    ['Más corto · más largo', s.shortest != null ? `${s.shortest} · ${s.longest}` : '—', 'días'],
    ...(def.usesMucus
      ? ([
          ['Día Pico medio', s.avgPeak != null ? num(s.avgPeak) : '—', 'del ciclo'],
          ['Fase post-Pico', s.avgPostPeak != null ? num(s.avgPostPeak) : '—', 'días'],
        ] as [string, string, string][])
      : []),
    ['Días de regla', s.avgBleed != null ? num(s.avgBleed) : '—', 'media'],
  ]
  const cal = data.settings.method === 'calendario' ? calendarWindow(data, cycles.filter((c) => c.complete && c.hasStart).map((c) => c.length)) : null

  return (
    <>
      <header className="top">
        <div>
          <div className="eyebrow">{def.name}</div>
          <h1>Resumen</h1>
        </div>
      </header>

      <section className="tiles">
        {tiles.map(([label, val, unit]) => (
          <div className="tile" key={label}>
            <span className="tile-label">{label}</span>
            <span className="tile-val">{val}</span>
            <span className="tile-unit">{unit}</span>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Duración de tus ciclos</h2>
        <p className="muted small">Días por ciclo{s.avg != null && s.completed > 1 ? ` · línea discontinua: media de ${num(s.avg)} días` : ''}</p>
        <CycleBars cycles={cycles} avg={s.avg} />
      </section>

      {cal && (
        <section className="card">
          <h2>Ventana fértil estimada</h2>
          <p className="big-val">
            Días {cal.win[0]} a {cal.win[1]}
          </p>
          <p className="muted small">{cal.basis}</p>
        </section>
      )}

      {hasData && (
        <section className="card">
          <h2>Ciclos</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ciclo</th>
                  <th>Inicio</th>
                  <th>Duración</th>
                  {def.usesMucus && <th>Pico</th>}
                  {def.usesTemp && <th>Subida</th>}
                  {(def.usesMucus || def.usesTemp) && <th>Post-Pico</th>}
                </tr>
              </thead>
              <tbody>
                {cycles
                  .filter((c) => c.hasStart)
                  .reverse()
                  .map((c) => (
                    <tr key={c.start}>
                      <td>{c.index}</td>
                      <td>{fmtShort(c.start)}</td>
                      <td>{c.complete ? `${c.length} d` : 'en curso'}</td>
                      {def.usesMucus && <td>{c.peakIdx !== null ? `día ${c.peakIdx + 1}` : '—'}</td>}
                      {def.usesTemp && <td>{c.shift ? `día ${c.shift.firstHigh + 1}` : '—'}</td>}
                      {(def.usesMucus || def.usesTemp) && <td>{c.postPeak !== null ? `${c.postPeak} d` : '—'}</td>}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {hasData && <InsightList items={signals} onClinics={() => onGo('clinic')} />}

      <section className="card">
        <h2>Descargar</h2>
        <p className="muted small">Para llevar a tu instructora o a tu médico. El archivo se genera en tu dispositivo.</p>
        <div className="btn-row">
          <button className="btn" disabled={!hasData || !!busy} onClick={() => run('excel')}>
            <Icon name="download" /> {busy === 'excel' ? 'Generando…' : 'Excel'}
          </button>
          <button className="btn" disabled={!hasData || !!busy} onClick={() => run('pdf')}>
            <Icon name="download" /> {busy === 'pdf' ? 'Generando…' : 'PDF'}
          </button>
        </div>
        {err && <p className="warn">{err}</p>}
      </section>
    </>
  )
}
