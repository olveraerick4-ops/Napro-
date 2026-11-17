import { useState } from 'react'
import type { Insight } from '../lib/insights'
import { Owl } from './Mascot'

const LEVEL = {
  urgente: { label: 'Consulta pronto', cls: 'lv-urgent' },
  consultar: { label: 'Coméntalo con un profesional', cls: 'lv-consult' },
  info: { label: 'Para tu información', cls: 'lv-info' },
}

export function InsightCard({ i, onClinics }: { i: Insight; onClinics: () => void }) {
  const [open, setOpen] = useState(false)
  const l = LEVEL[i.level]
  return (
    <article className={'insight ' + l.cls}>
      <div className="insight-head">
        <span className="insight-level">{l.label}</span>
        <h3>{i.title}</h3>
      </div>
      <p>{i.seen}</p>
      <p className="muted">{i.meaning}</p>
      <button className="link-btn" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? 'Ocultar dónde lo vemos' : `Dónde lo vemos (${i.evidence.length})`}
      </button>
      {open && (
        <ul className="evidence">
          {i.evidence.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      {i.level !== 'info' && (
        <button className="btn small" onClick={onClinics}>
          Buscar un profesional
        </button>
      )}
    </article>
  )
}

export function InsightList({ items, onClinics }: { items: Insight[]; onClinics: () => void }) {
  return (
    <section className="card">
      <h2>Señales en tu gráfica</h2>
      <p className="muted small">
        Patrones que la guía del Modelo Creighton relaciona con la salud hormonal y ginecológica. No son un diagnóstico: son motivos para revisar tu gráfica con tu instructora o tu médico.
      </p>
      {items.length ? (
        <div className="insight-list">
          {items.map((i) => (
            <InsightCard key={i.id} i={i} onClinics={onClinics} />
          ))}
        </div>
      ) : (
        <div className="facts-intro">
          <Owl mood="fiesta" size={52} />
          <p className="ok">No vemos ninguna señal llamativa en los ciclos registrados. Cuantos más ciclos completos registres, más fiable es esta revisión.</p>
        </div>
      )}
    </section>
  )
}
