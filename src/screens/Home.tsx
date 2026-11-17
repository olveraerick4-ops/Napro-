import type { Cycle } from '../lib/engine'
import { addDays, diffDays, fmtLong, fmtShort, num, today } from '../lib/dates'
import { codeFor, describeEntry, methodDef } from '../lib/methods'
import { stats } from '../lib/engine'
import { useData } from '../lib/store'
import { stageDef } from '../lib/stages'
import type { Insight } from '../lib/insights'
import type { Tab } from '../App'
import { CompanionCard } from '../components/Mascot'
import { companionMessage } from '../lib/companion'
import { factOfDay } from '../data/facts'
import { Icon, Stamp } from '../components/art'

const FERT = {
  fertil: { label: 'Día fértil', cls: 'fert' },
  infertil: { label: 'Día infértil', cls: 'infert' },
  desconocido: { label: 'Sin determinar', cls: 'unk' },
}

export function Home({ cycles, signals, onEdit, onGo }: { cycles: Cycle[]; signals: Insight[]; onEdit: (d: string) => void; onGo: (t: Tab, section?: string) => void }) {
  const data = useData()
  const method = data.settings.method
  const def = methodDef(method)
  const now = today()
  const cur = cycles[cycles.length - 1]
  const info = cur?.days.find((d) => d.date === now)
  const st = stats(cycles)
  const week = Array.from({ length: 7 }, (_, i) => addDays(now, i - 6))
  const all = new Map(cycles.flatMap((c) => c.days).map((d) => [d.date, d]))
  const stage = stageDef(data.settings.stage)
  const since = data.settings.stageSince
  const f = info?.entry && !stage.noFertility ? FERT[info.fertility] : null
  const important = signals.filter((x) => x.level !== 'info')
  const msg = companionMessage(data, cycles, signals, now)
  const fact = factOfDay(now)
  const ACTIONS = {
    register: { label: info?.entry ? 'Editar registro' : 'Registrar hoy', onClick: () => onEdit(now) },
    signals: { label: 'Ver señales', onClick: () => onGo('stats') },
    clinics: { label: 'Buscar un profesional', onClick: () => onGo('clinic') },
    stage: { label: 'Indicar la fecha', onClick: () => onGo('more', 'etapa') },
    facts: undefined,
  }
  // embarazo: semanas desde la concepción (+2 semanas obstétricas) y fecha probable de parto
  const preg =
    stage.id === 'embarazo' && since
      ? (() => {
          const dd = diffDays(since, now) + 14
          return { w: Math.floor(dd / 7), d: dd % 7, due: addDays(since, 266) }
        })()
      : null
  const weeksSince = since && stage.dateLabel && stage.id !== 'embarazo' ? Math.floor(diffDays(since, now) / 7) : null

  return (
    <>
      <header className="top">
        <div>
          <div className="eyebrow">{def.name}</div>
          <h1>{fmtLong(now)}</h1>
        </div>
        <button className="stage-chip" onClick={() => onGo('more', 'etapa')}>
          {stage.short}
        </button>
      </header>

      <CompanionCard mood={msg.mood} title={msg.title} text={msg.text} action={msg.action ? ACTIONS[msg.action] : undefined} />

      {stage.id === 'embarazo' && (
        <section className="card preg">
          {preg ? (
            <>
              <div className="preg-row">
                <div>
                  <span className="preg-num">
                    {preg.w}
                    <small> sem</small> {preg.d}
                    <small> d</small>
                  </span>
                  <span className="muted small">de embarazo</span>
                </div>
                <div className="preg-due">
                  <span className="muted small">Fecha probable de parto</span>
                  <b>{fmtShort(preg.due)} {preg.due.slice(0, 4)}</b>
                </div>
              </div>
              <p className="muted small">Calculado desde la concepción ({fmtShort(since!)}). Las semanas se cuentan como lo hace el médico, desde dos semanas antes de la concepción.</p>
            </>
          ) : (
            <p className="muted">Indica el día de la concepción (el día Pico del ciclo en que te embarazaste) en <b>Más → Etapa de vida</b> para ver las semanas y la fecha probable de parto.</p>
          )}
        </section>
      )}

      <section className="card hero">
        <div className="hero-day">
          <span className="hero-num">{cur?.hasStart && info ? info.cd : '–'}</span>
          <span className="hero-cap">{cur?.hasStart && info ? 'día del ciclo' : weeksSince !== null ? `semana ${weeksSince + 1} desde ${stage.id === 'tras-pildora' ? 'que la dejaste' : stage.id === 'tras-perdida' ? 'la pérdida' : 'el parto'}` : 'día del ciclo'}</span>
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

      {important.length > 0 && msg.action !== 'signals' && msg.action !== 'clinics' && (
        <button className={'card signal-teaser' + (important.some((x) => x.level === 'urgente') ? ' urgent' : '')} onClick={() => onGo('stats')}>
          <b>
            {important.some((x) => x.level === 'urgente')
              ? important.find((x) => x.level === 'urgente')!.title
              : important.length === 1
                ? `Tu gráfica muestra una señal: ${important[0].title.toLowerCase()}`
                : `Tu gráfica muestra ${important.length} señales para comentar con un profesional`}
          </b>
          <span className="muted small">Ver detalles en Resumen →</span>
        </button>
      )}

      {stage.notes.length > 0 && stage.id !== 'regular' && (
        <section className="card">
          <h2>{stage.name}</h2>
          <ul className="stage-notes">
            {stage.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
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

      <section className="card fact">
        <span className="eyebrow">¿Sabías que…?</span>
        <h2>{fact.title}</h2>
        <p>{fact.text}</p>
        <div className="fact-foot">
          <small>Fuente: {fact.source}</small>
          <button className="link-btn" onClick={() => onGo('more', 'datos-naturales')}>
            Ver más datos →
          </button>
        </div>
      </section>

      {st.nextPeriod && !stage.noFertility && (
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
