import type { CrBase, CrMod } from '../types'
import type { StampKind } from '../lib/engine'

// ---------- Estampas ----------
export const STAMP_COLORS: Record<StampKind, { fill: string; stroke: string; label: string }> = {
  empty: { fill: 'transparent', stroke: '#b9b0b6', label: 'Sin registro' },
  red: { fill: '#d6483f', stroke: '#b3362e', label: 'Roja · sangrado' },
  green: { fill: '#4f9e63', stroke: '#3d824f', label: 'Verde · seco, infértil' },
  'white-baby': { fill: '#ffffff', stroke: '#b9b0b6', label: 'Blanca con bebé · moco' },
  'green-baby': { fill: '#4f9e63', stroke: '#3d824f', label: 'Verde con bebé · seco dentro de la cuenta de 3' },
  yellow: { fill: '#ecc845', stroke: '#c9a227', label: 'Amarilla · flujo no fértil (indicada por tu instructora)' },
  plain: { fill: '#ece6ea', stroke: '#cfc6cc', label: 'Día registrado' },
}

export function Stamp({ kind, mark, size = 36 }: { kind: StampKind; mark?: string; size?: number }) {
  const c = STAMP_COLORS[kind]
  const baby = kind === 'white-baby' || kind === 'green-baby'
  const ink = kind === 'white-baby' ? '#5b5560' : '#ffffff'
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 30 36" role="img" aria-label={c.label + (mark ? ` · ${mark}` : '')}>
      <rect x="1" y="1" width="28" height="34" rx="4" fill={c.fill} stroke={c.stroke} strokeWidth="1.2" strokeDasharray={kind === 'empty' ? '3 3' : undefined} />
      {baby && (
        <g fill="none" stroke={ink} strokeWidth="1.4" strokeLinecap="round">
          <circle cx="15" cy="23" r="6.2" fill={kind === 'white-baby' ? '#fbe3d6' : 'none'} />
          <path d="M12.6 22.2h.01M17.4 22.2h.01" strokeWidth="1.8" />
          <path d="M12.8 25.2c1.3 1.2 3.1 1.2 4.4 0" />
          <path d="M15 16.8c.2-1.6 1.6-2.2 2.4-1.4" />
        </g>
      )}
      {mark && (
        <text x="15" y={baby ? 12.5 : 22} textAnchor="middle" fontSize={baby ? 11 : 14} fontWeight="700" fill={kind === 'white-baby' || kind === 'empty' || kind === 'plain' || kind === 'yellow' ? '#3a3340' : '#fff'} fontFamily="system-ui, sans-serif">
          {mark}
        </text>
      )}
    </svg>
  )
}

// ---------- Dibujos de las observaciones ----------
const PAPER = '#fffdf9'
const LINE = '#8d8490'

function Paper({ children }: { children?: React.ReactNode }) {
  return (
    <svg viewBox="0 0 64 48" width="64" height="48" aria-hidden="true">
      <rect x="6" y="6" width="52" height="36" rx="3" fill={PAPER} stroke={LINE} strokeWidth="1.2" />
      <path d="M6 15h52" stroke={LINE} strokeWidth=".6" strokeDasharray="1.5 2.5" opacity=".6" />
      {children}
    </svg>
  )
}

function Fingers({ gap, color }: { gap: number; color: string }) {
  // pulgar e índice separados «gap» px, con el hilo de moco entre ambos
  const top = 24 - gap / 2
  const bot = 24 + gap / 2
  return (
    <svg viewBox="0 0 64 48" width="64" height="48" aria-hidden="true">
      <path d={`M14 ${top - 10}c0-4 30-4 36 0 3 2 3 8-2 10H18c-5-2-5-7-4-10z`} fill="#f3cdb8" stroke="#c99a82" strokeWidth="1" />
      <path d={`M14 ${bot + 10}c0 4 30 4 36 0 3-2 3-8-2-10H18c-5 2-5 7-4 10z`} fill="#f3cdb8" stroke="#c99a82" strokeWidth="1" />
      <path d={`M29 ${top - 1}C31 ${top + gap * 0.3} 31 ${bot - gap * 0.3} 29 ${bot + 1}h6C33 ${bot - gap * 0.3} 33 ${top + gap * 0.3} 35 ${top - 1}z`} fill={color} stroke="#9aa7b5" strokeWidth=".8" />
    </svg>
  )
}

export function BaseArt({ base }: { base: CrBase }) {
  switch (base) {
    case '0':
      return (
        <Paper>
          <path d="M14 24l5-3 5 4 6-4 5 3 6-4 5 4 4-2M16 32l6-3 5 3 6-3 6 4 7-3" fill="none" stroke={LINE} strokeWidth="1" strokeLinecap="round" opacity=".7" />
        </Paper>
      )
    case '2':
    case '10DL':
      return (
        <Paper>
          <ellipse cx="32" cy="28" rx="13" ry="7" fill="#cfe3f1" />
          {base === '10DL' && <Slide />}
        </Paper>
      )
    case '4':
    case '10SL':
      return (
        <Paper>
          <ellipse cx="32" cy="28" rx="13" ry="7" fill="#cfe3f1" />
          <g fill="#fff" stroke="#7fa9c9" strokeWidth=".7">
            <path d="M28 26l1.2 2.4 2.4 1.2-2.4 1.2L28 33.2l-1.2-2.4-2.4-1.2 2.4-1.2z" />
            <path d="M37 23.5l.8 1.6 1.6.8-1.6.8-.8 1.6-.8-1.6-1.6-.8 1.6-.8z" />
          </g>
          {base === '10SL' && <Slide />}
        </Paper>
      )
    case '2W':
    case '10WL':
      return (
        <Paper>
          <ellipse cx="32" cy="28" rx="21" ry="11" fill="#a9cde6" />
          <path d="M20 25c5-4 13-5 20-3" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          {base === '10WL' && <Slide />}
        </Paper>
      )
    case '6':
      return <Fingers gap={4} color="#f4f1ea" />
    case '8':
      return <Fingers gap={12} color="#eef1ee" />
    case '10':
      return <Fingers gap={20} color="#e3eef5" />
  }
}

function Slide() {
  // flechas de «deslizamiento»: sensación lubricante
  return (
    <g fill="none" stroke="#a4566a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 11h12M48 8l4 3-4 3" />
    </g>
  )
}

// ---------- Tabla de colores ----------
export const MOD_SWATCH: Partial<Record<CrMod, { bg: string; see: boolean }>> = {
  K: { bg: 'linear-gradient(135deg, rgba(214,233,245,.55), rgba(255,255,255,.25))', see: true },
  'C/K': { bg: 'linear-gradient(135deg, #f1efe9 0 50%, rgba(214,233,245,.5) 50%)', see: true },
  C: { bg: '#f1efe9', see: false },
  Y: { bg: '#efe2a4', see: false },
  B: { bg: '#8a5a3c', see: false },
  R: { bg: '#cf4a41', see: false },
  P: { bg: '#fbf8f1', see: false },
  G: { bg: '#e6d9a0', see: false },
}

export function Swatch({ mod }: { mod: CrMod }) {
  const s = MOD_SWATCH[mod]
  if (!s) return null
  return (
    <span className="swatch" aria-hidden="true">
      {s.see && <span className="swatch-lines" />}
      <span className="swatch-fill" style={{ background: s.bg }} />
    </span>
  )
}

// ---------- Iconos ----------
export function Icon({ name }: { name: 'home' | 'chart' | 'stats' | 'clinic' | 'more' | 'plus' | 'left' | 'right' | 'close' | 'download' }) {
  const p: Record<string, React.ReactNode> = {
    home: <path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1z" />,
    chart: (
      <>
        <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
        <path d="M3.5 9.5h17M3.5 14.5h17M9 4.5v15M15 4.5v15" />
      </>
    ),
    stats: <path d="M5 20V11M12 20V5M19 20v-6" />,
    clinic: (
      <>
        <path d="M12 21s-7-5.2-7-11a7 7 0 0114 0c0 5.800-7 11-7 11z" />
        <path d="M12 7.500v5M9.500 10h5" />
      </>
    ),
    more: <path d="M5 7h14M5 12h14M5 17h14" />,
    plus: <path d="M12 5v14M5 12h14" />,
    left: <path d="M15 5l-7 7 7 7" />,
    right: <path d="M9 5l7 7-7 7" />,
    close: <path d="M6 6l12 12M18 6L6 18" />,
    download: <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />,
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {p[name]}
    </svg>
  )
}
