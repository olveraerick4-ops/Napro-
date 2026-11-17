export type Mood = 'hola' | 'feliz' | 'pensando' | 'cuidado' | 'fiesta'

export const MASCOT_NAME = 'Sofía'

const INK = '#3b2f2a'
const WING = '#8a6c58'

/** Sofía: una pequeña búho que te enseña a leer tu cuerpo. */
export function Owl({ mood = 'feliz', size = 72 }: { mood?: Mood; size?: number }) {
  const look = mood === 'pensando' ? { dx: 1.5, dy: -1 } : { dx: 0, dy: 0 }
  const leftUp = mood === 'hola' || mood === 'fiesta'
  const rightUp = mood === 'fiesta'
  return (
    <svg className={'owl owl-' + mood} width={size} height={size} viewBox="0 0 80 80" role="img" aria-label={`${MASCOT_NAME}, tu compañera`}>
      {/* orejas */}
      <path d="M23 24l3-13 9 9zM57 24l-3-13-9 9z" fill={WING} />
      {/* cuerpo y pecho */}
      <ellipse cx="40" cy="46" rx="22" ry="24" fill="#a6896f" />
      <path d="M28 52q12-8 24 0v6q-12 12-24 0z" fill="#efe2d1" />
      <g stroke="#d9c6b0" strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M34 57q3 2 6 0q3 2 6 0M36 62q2 1.6 4 0q2 1.6 4 0" />
      </g>
      {/* alas */}
      <path
        className={leftUp ? 'owl-wing-wave' : undefined}
        d={leftUp ? 'M19 48c-6-4-9-11-6-16' : 'M19 46c-4 6-3 13 3 16'}
        fill="none"
        stroke={WING}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d={rightUp ? 'M61 48c6-4 9-11 6-16' : 'M61 46c4 6 3 13-3 16'} fill="none" stroke={WING} strokeWidth="5" strokeLinecap="round" />
      {/* disco facial */}
      <path d="M22 31q9-7 18 0q9-7 18 0q-2 13-18 13q-16 0-18-13z" fill="#c8ad93" />
      {/* ojos */}
      {mood === 'fiesta' ? (
        <g fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round">
          <path d="M25.5 39q5.5-5.5 11 0M43.5 39q5.5-5.5 11 0" />
        </g>
      ) : (
        <g className="owl-eyes">
          <circle cx="31" cy="38" r="8.5" fill="#fffaf2" />
          <circle cx="49" cy="38" r="8.5" fill="#fffaf2" />
          <circle cx={31 + look.dx} cy={38.6 + look.dy} r="4.2" fill={INK} />
          <circle cx={49 + look.dx} cy={38.6 + look.dy} r="4.2" fill={INK} />
          <circle cx={32.4 + look.dx} cy={37.2 + look.dy} r="1.3" fill="#fff" />
          <circle cx={50.4 + look.dx} cy={37.2 + look.dy} r="1.3" fill="#fff" />
        </g>
      )}
      {mood === 'cuidado' && (
        <g fill="none" stroke="#6e5646" strokeWidth="2.4" strokeLinecap="round">
          <path d="M23 30.5q5-3.5 10-4.5M57 30.5q-5-3.5-10-4.5" />
        </g>
      )}
      {/* pico, mejillas y patas */}
      <path d={mood === 'cuidado' ? 'M37 44l3 3.5 3-3.5z' : 'M37 44l3 4.5 3-4.5z'} fill="#e9a64a" />
      <g fill="#f08a6c" opacity=".45">
        <ellipse cx="23.5" cy="46" rx="3" ry="1.9" />
        <ellipse cx="56.5" cy="46" rx="3" ry="1.9" />
      </g>
      <path d="M33 69q2 3 4 0M43 69q2 3 4 0" fill="#e9a64a" />
      {mood === 'pensando' && (
        <g fill="#9fb3b4">
          <circle cx="66" cy="20" r="2" />
          <circle cx="72" cy="12" r="3" />
        </g>
      )}
      {mood === 'fiesta' && (
        <g fill="#f4b860">
          <path d="M70 30l1.4 3 3 1.4-3 1.4-1.4 3-1.4-3-3-1.4 3-1.4z" />
          <path d="M9 26l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
        </g>
      )}
    </svg>
  )
}

export function CompanionCard({
  mood,
  title,
  text,
  action,
}: {
  mood: Mood
  title?: string
  text: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <section className="companion">
      <Owl mood={mood} size={68} />
      <div className="bubble">
        {title && <b>{title}</b>}
        <p>{text}</p>
        {action && (
          <button className="link-btn" onClick={action.onClick}>
            {action.label} →
          </button>
        )}
      </div>
    </section>
  )
}
