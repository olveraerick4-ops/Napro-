import { useState } from 'react'
import { CLINICS, CLINICS_REVIEWED, COUNTRIES } from '../data/clinics'
import { setSettings, useData } from '../lib/store'

export function Clinics() {
  const data = useData()
  const country = COUNTRIES[data.settings.country] ? data.settings.country : 'ES'
  const [q, setQ] = useState('')
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const match = (c: (typeof CLINICS)[number]) => !q || norm([c.name, c.city, c.description, ...c.methods].join(' ')).includes(norm(q))
  const local = CLINICS.filter((c) => c.country === country && match(c))
  const intl = country === 'INT' ? [] : CLINICS.filter((c) => c.country === 'INT' && match(c))

  const Card = ({ c }: { c: (typeof CLINICS)[number] }) => (
    <article className="card clinic">
      <div className="clinic-head">
        <h3>{c.name}</h3>
        <span className="tag">{c.kind}</span>
      </div>
      <p className="muted">{c.city}</p>
      <p>{c.description}</p>
      <div className="tags">
        {c.methods.map((m) => (
          <span key={m} className="tag soft">
            {m}
          </span>
        ))}
      </div>
      <div className="clinic-actions">
        {c.web && (
          <a className="btn small" href={c.web} target="_blank" rel="noopener noreferrer">
            Sitio web
          </a>
        )}
        {c.phone && (
          <a className="btn small" href={`tel:${c.phone.replace(/\s/g, '')}`}>
            {c.phone}
          </a>
        )}
        {c.email && (
          <a className="btn small" href={`mailto:${c.email}`}>
            Correo
          </a>
        )}
      </div>
    </article>
  )

  return (
    <>
      <header className="top">
        <div>
          <div className="eyebrow">Naprotecnología y métodos naturales</div>
          <h1>Clínicas y contactos</h1>
        </div>
      </header>
      <section className="card filters">
        <label>
          <span>País</span>
          <select value={country} onChange={(e) => setSettings({ country: e.target.value })}>
            {Object.entries(COUNTRIES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Buscar</span>
          <input type="search" placeholder="Ciudad, nombre, método…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </section>

      {local.map((c) => (
        <Card key={c.name} c={c} />
      ))}
      {!local.length && (
        <section className="card">
          <p className="muted">No hay resultados con ese filtro. Prueba los directorios internacionales de abajo.</p>
        </section>
      )}
      {!!intl.length && <h2 className="section-title">Directorios internacionales</h2>}
      {intl.map((c) => (
        <Card key={c.name} c={c} />
      ))}
      <p className="disclaimer">
        Listado informativo revisado en {CLINICS_REVIEWED}. Aurora no tiene relación con estos centros ni recibe nada por mostrarlos. Confirma siempre los datos en su sitio web antes de acudir.
      </p>
    </>
  )
}
