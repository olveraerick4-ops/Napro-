import { useState } from 'react'
import type { MethodId } from '../types'
import { METHODS } from '../lib/methods'
import { setSettings, useData } from '../lib/store'

export function MethodPicker({ value, onChange }: { value: MethodId; onChange: (m: MethodId) => void }) {
  return (
    <div className="method-list" role="radiogroup" aria-label="Método">
      {METHODS.map((m) => (
        <button key={m.id} role="radio" aria-checked={value === m.id} className={'method' + (value === m.id ? ' on' : '')} onClick={() => onChange(m.id)}>
          <span className="method-head">
            <b>{m.name}</b>
            <span className="radio" />
          </span>
          <span className="method-tag">{m.tagline}</span>
          {value === m.id && (
            <span className="method-more">
              {m.description}
              <span className="tags">
                {m.records.map((r) => (
                  <span key={r} className="tag">
                    {r}
                  </span>
                ))}
              </span>
              <em>{m.note}</em>
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export function Onboarding() {
  const data = useData()
  const [step, setStep] = useState(0)
  const [method, setMethod] = useState<MethodId>(data.settings.method)

  if (step === 0)
    return (
      <div className="onb">
        <div className="onb-hero">
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="84" height="84" />
          <h1>Aurora</h1>
          <p className="lead">Tu ciclo, naturalmente.</p>
        </div>
        <ul className="onb-points">
          <li>Registra cada día con el método natural que tú uses.</li>
          <li>Mira tu gráfica y tus resúmenes, y descárgalos en Excel o PDF.</li>
          <li>Encuentra instructoras y médicos de naprotecnología.</li>
          <li>Tus datos se guardan solo en este dispositivo.</li>
        </ul>
        <button className="btn primary big" onClick={() => setStep(1)}>
          Empezar
        </button>
      </div>
    )

  return (
    <div className="onb">
      <h1 className="onb-title">¿Qué método quieres usar?</h1>
      <p className="hint">Podrás cambiarlo cuando quieras; tus registros no se pierden.</p>
      <MethodPicker value={method} onChange={setMethod} />
      <p className="disclaimer">
        Aurora es un cuaderno de registro. No es un producto sanitario ni sustituye a tu instructora o a tu médico.
      </p>
      <button className="btn primary big" onClick={() => setSettings({ method, onboarded: true })}>
        Continuar
      </button>
    </div>
  )
}
