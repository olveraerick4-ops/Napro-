import { useState } from 'react'
import type { LifeStage, MethodId } from '../types'
import { STAGES, stageDef } from '../lib/stages'
import { Alba } from '../components/Mascot'
import { FACTS } from '../data/facts'
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

export function StagePicker({
  value,
  since,
  onChange,
}: {
  value: LifeStage
  since?: string
  onChange: (stage: LifeStage, since?: string) => void
}) {
  const sd = stageDef(value)
  return (
    <div className="stage-picker">
      <div className="chips" role="radiogroup" aria-label="Etapa de vida">
        {STAGES.map((st) => (
          <button key={st.id} role="radio" aria-checked={value === st.id} className={'chip' + (value === st.id ? ' on' : '')} onClick={() => onChange(st.id, since)}>
            {st.name}
          </button>
        ))}
      </div>
      <p className="hint">{sd.description}</p>
      {sd.dateLabel && (
        <label className="field">
          <span>{sd.dateLabel}</span>
          <input id="stage-since" type="date" value={since ?? ''} max={new Date().toISOString().slice(0, 10)} onChange={(e) => onChange(value, e.target.value || undefined)} />
        </label>
      )}
    </div>
  )
}

export function Onboarding() {
  const data = useData()
  const [step, setStep] = useState(0)
  const [method, setMethod] = useState<MethodId>(data.settings.method)
  const [stage, setStage] = useState<LifeStage>(data.settings.stage)
  const [since, setSince] = useState<string | undefined>(data.settings.stageSince)

  if (step === 0)
    return (
      <div className="onb">
        <div className="onb-hero">
          <Alba mood="hola" size={120} />
          <h1>Aurora</h1>
          <p className="lead">Tu ciclo, naturalmente.</p>
        </div>
        <div className="onb-bubble">
          <b>¡Hola! Soy Alba.</b> Te acompañaré mientras aprendes a leer tu ciclo: te recordaré tus observaciones, te explicaré tu gráfica y te avisaré si algo merece una consulta.
        </div>
        <ul className="onb-points">
          <li>Registra cada día con el método natural que tú uses.</li>
          <li>Mira tu gráfica y tus resúmenes, y descárgalos en Excel o PDF.</li>
          <li>Encuentra instructoras y médicos de naprotecnología.</li>
          <li>Tus datos se guardan solo en este dispositivo.</li>
        </ul>
        <div className="onb-fact">
          <span className="eyebrow">¿Sabías que…?</span>
          <p>{FACTS[0].text}</p>
        </div>
        <button className="btn primary big" onClick={() => setStep(1)}>
          Empezar
        </button>
      </div>
    )

  if (step === 2)
    return (
      <div className="onb">
        <div className="onb-ask">
          <Alba mood="pensando" size={56} />
          <h1 className="onb-title">¿En qué etapa estás?</h1>
        </div>
        <p className="hint">Cada etapa tiene sus propias instrucciones y patrones de gráfica. Puedes cambiarla cuando quieras.</p>
        <StagePicker
          value={stage}
          since={since}
          onChange={(st, d) => {
            setStage(st)
            setSince(d)
          }}
        />
        <p className="disclaimer">
          Aurora es un cuaderno de registro. No es un producto sanitario ni sustituye a tu instructora o a tu médico.
        </p>
        <button className="btn primary big" onClick={() => setSettings({ method, stage, stageSince: since, onboarded: true })}>
          Empezar a registrar
        </button>
      </div>
    )

  return (
    <div className="onb">
      <div className="onb-ask">
        <Alba mood="feliz" size={56} />
        <h1 className="onb-title">¿Qué método quieres usar?</h1>
      </div>
      <p className="hint">Podrás cambiarlo cuando quieras; tus registros no se pierden.</p>
      <MethodPicker value={method} onChange={setMethod} />
      <button className="btn primary big" onClick={() => setStep(2)}>
        Continuar
      </button>
    </div>
  )
}
