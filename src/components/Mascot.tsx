export type Mood = 'hola' | 'feliz' | 'pensando' | 'cuidado' | 'fiesta'

/** Alba: un pequeño sol que amanece detrás de una colina. */
export function Alba({ mood = 'feliz', size = 72 }: { mood?: Mood; size?: number }) {
  const eyesClosed = mood === 'fiesta'
  return (
    <svg className={'alba alba-' + mood} width={size} height={size} viewBox="0 0 80 80" role="img" aria-label="Alba, tu compañera">
      <defs>
        <radialGradient id="alba-body" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#ffd98a" />
          <stop offset="1" stopColor="#f2a74e" />
        </radialGradient>
      </defs>
      {/* rayos */}
      <g className="alba-rays" stroke="#f4b860" strokeWidth="3.4" strokeLinecap="round">
        <path d="M40 6v7M17 15l4.5 5M63 15l-4.5 5M7 34h7M73 34h-7" />
      </g>
      {/* cuerpo */}
      <circle cx="40" cy="42" r="24" fill="url(#alba-body)" />
      {/* cara */}
      {eyesClosed ? (
        <g fill="none" stroke="#3b2f2a" strokeWidth="2.4" strokeLinecap="round">
          <path d="M29.5 39.5q3-3.5 6 0M44.5 39.5q3-3.5 6 0" />
        </g>
      ) : (
        <g fill="#3b2f2a">
          <ellipse cx="32.5" cy={mood === 'pensando' ? 37.5 : 39} rx="2.5" ry="3" />
          <ellipse cx="47.5" cy={mood === 'pensando' ? 37.5 : 39} rx="2.5" ry="3" />
          <circle cx="33.3" cy={mood === 'pensando' ? 36.6 : 38} r=".9" fill="#fff" />
          <circle cx="48.3" cy={mood === 'pensando' ? 36.6 : 38} r=".9" fill="#fff" />
        </g>
      )}
      {mood === 'cuidado' && (
        <g fill="none" stroke="#3b2f2a" strokeWidth="1.8" strokeLinecap="round">
          <path d="M29 33.5l6-1.5M51 33.5l-6-1.5" />
        </g>
      )}
      <g fill="#f08a6c" opacity=".55">
        <ellipse cx="27" cy="46" rx="3.6" ry="2.3" />
        <ellipse cx="53" cy="46" rx="3.6" ry="2.3" />
      </g>
      <g fill="none" stroke="#3b2f2a" strokeWidth="2.2" strokeLinecap="round">
        {mood === 'pensando' && <circle cx="41" cy="47.5" r="2" />}
        {mood === 'cuidado' && <path d="M35.5 48.5q4.5-2 9 0" />}
        {(mood === 'feliz' || mood === 'hola') && <path d="M34.5 45.5q5.5 5 11 0" />}
        {mood === 'fiesta' && <path d="M33 44.5q7 8 14 0z" fill="#b5523a" stroke="#3b2f2a" />}
      </g>
      {/* colina */}
      <path d="M2 66c14-10 26-12 38-8s26 4 38-4v26H2z" fill="#2f8a83" />
      <path d="M2 72c18-8 34-6 48-2s20 2 28-2v12H2z" fill="#1f6b73" />
      {mood === 'hola' && (
        <path className="alba-hand" d="M64 47c3-2 6-1 7 2" fill="none" stroke="#f2a74e" strokeWidth="4.5" strokeLinecap="round" />
      )}
      {mood === 'pensando' && (
        <g fill="#9fb3b4">
          <circle cx="66" cy="26" r="2" />
          <circle cx="71" cy="19" r="3" />
        </g>
      )}
      {mood === 'fiesta' && (
        <g fill="#f4b860">
          <path d="M70 46l1.4 3 3 1.4-3 1.4-1.4 3-1.4-3-3-1.4 3-1.4z" />
          <path d="M11 50l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
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
      <Alba mood={mood} size={68} />
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
