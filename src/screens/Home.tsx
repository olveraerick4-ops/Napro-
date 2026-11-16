import type { Cycle } from '../lib/engine'
import { addDays, fmtLong, fmtShort, num, today } from '../lib/dates'
import { codeFor, describeEntry, methodDef } from '../lib/methods'
import { stats } from '../lib/engine'
import { useData } from '../lib/store'
import { Icon, Stamp } from '../components/art'

const FERT = {
  fertil: { label: 'Día fértil', cls: 'fert' },
  infertil: { label: 'Día infértil', cls: 'infert' },
  desconocido: { label: 'Sin determinar', cls: 'unk' },
}

export function Home({ cycles, onEdit }: { cycles: Cycle[]; onEdit: (d: string) => void }) {
  const data = useData()
  const method = data.settings.method
  const def = methodDef(method)
  const now = today()
  const cur = cycles[cycles.length - 1]
  const info = cur?.days.find((d) => d.date === now)
  const st = stats(cycles)
  const week = Array.from({ length: 7 }, (_, i) => addDays(now, i - 6))
  const all = new Map(cycles.flatMap((c) => c.days).map((d) => [d.date, d]))
  const f = info?.entry ? FERT[info.fertility] : null

  return (
    <>
      <header className="top">
        <div>
          <div className="eyebrow">{def.name}</div>
          <h1>{fmtLong(now)}</h1>
        </div>
      </header>

      <section className="card hero">
        <div className="hero-day">
          <span className="hero-num">{cur?.hasStart && info ? info.cd : '–'}</span>
          <span className="hero-cap">día del ciclo</span>
        </div>
        <div className="hero-info">
          {info?.entry ? (
            <>
              <div className="hero-stamp">
                <Stamp kind={info.stamp} mark={info.mark} size={30} />
                <b>{codeFor(info.entry, method) || 'Registrado'}</b>
              </div>
              <p>{describeEntry(info.entry, method)}</p>
            </>
          ) : (
            <p className="muted">Aún no has registrado el día de hoy.</p>
          )}
          <button className="btn primary" onClick={() => onEdit(now)}>
            <Icon name="plus" /> {info?.entry ? 'Editar registro' : 'Registrar hoy'}
          </button>
        </div>
      </section>

      {f && info && (
        <section className={'card status ' + f.cls}>
          <b>{f.label}</b>
          <p>{info.reason}</p>
          <small>Orientación según las reglas básicas del método a partir de lo que has registrado. Sigue siempre las indicaciones de tu instructora.</small>
        </section>
      )}

      <section className="card">
        <h2>Últimos 7 días</h2>
        <div className="week">
          {week.map((d) => {
            const x = all.get(d)
            return (
              <button key={d} className="week-day" onClick={() => onEdit(d)} aria-label={`Editar ${fmtLong(d)}`}>
                <small>{fmtShort(d).split(' ')[0]}</small>
                <Stamp kind={x?.stamp ?? 'empty'} mark={x?.mark} size={30} />
                <small className="code">{x?.entry ? codeFor(x.entry, method).split(' ').slice(0, 2).join(' ') : ''}</small>
              </button>
            )
          })}
        </div>
      </section>

      {st.nextPeriod && (
        <section className="card row">
          <div>
            <h2>Próxima regla estimada</h2>
            <p className="muted">Según la duración media de tus ciclos ({num(st.avg!)} días).</p>
          </div>
          <b className="big-val">{fmtShort(st.nextPeriod)}</b>
        </section>
      )}

      {!cycles.length && (
        <section className="card">
          <h2>Para empezar</h2>
          <p className="muted">
            Registra hoy y, cuando llegue tu regla, marca «Empieza un ciclo nuevo». Si quieres ver cómo queda la app con datos, carga el ejemplo desde <b>Más</b>.
          </p>
        </section>
      )}
    </>
  )
}
