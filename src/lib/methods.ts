import type { Appearance, Bleeding, CrBase, CrMod, DayEntry, Freq, MethodId, Sensation } from '../types'

export interface MethodDef {
  id: MethodId
  name: string
  short: string
  tagline: string
  description: string
  records: string[]
  usesMucus: 'creighton' | 'simple' | null
  usesTemp: boolean
  note: string
}

export const METHODS: MethodDef[] = [
  {
    id: 'creighton',
    name: 'Modelo Creighton',
    short: 'Creighton',
    tagline: 'Moco cervical con registro estandarizado',
    description:
      'Observación externa del moco cervical al ir al baño, con un código estandarizado (0, 2, 4, 6, 8, 10 + letras) y estampas de colores. Es la base de la NaProTecnología.',
    records: ['Sangrado', 'Sensación, elasticidad y color', 'Frecuencia', 'Estampas y día Pico'],
    usesMucus: 'creighton',
    usesTemp: false,
    note: 'Se aprende con una instructora FertilityCare; la app es tu cuaderno de registro, no sustituye sus indicaciones.',
  },
  {
    id: 'billings',
    name: 'Método de Ovulación Billings',
    short: 'Billings',
    tagline: 'Sensación en la vulva y apariencia del moco',
    description:
      'Se centra en la sensación que percibes en la vulva a lo largo del día (seca, húmeda, resbalosa) y en lo que ves. El último día de sensación resbalosa es el día Cúspide (Pico).',
    records: ['Sangrado', 'Sensación', 'Apariencia', 'Día Cúspide y cuenta 1-2-3'],
    usesMucus: 'simple',
    usesTemp: false,
    note: 'Lo ideal es aprenderlo con una instructora acreditada por WOOMB.',
  },
  {
    id: 'sintotermico',
    name: 'Método Sintotérmico',
    short: 'Sintotérmico',
    tagline: 'Temperatura basal + moco cervical',
    description:
      'Combina dos señales: el moco cervical (que anuncia la ovulación) y la subida de temperatura basal (que la confirma). El doble control lo hace muy fiable.',
    records: ['Temperatura al despertar', 'Sensación y apariencia del moco', 'Sangrado'],
    usesMucus: 'simple',
    usesTemp: true,
    note: 'La app aplica la regla «3 sobre 6» para detectar la subida de temperatura y la compara con el día Pico del moco.',
  },
  {
    id: 'temperatura',
    name: 'Temperatura basal',
    short: 'Temperatura',
    tagline: 'Solo temperatura al despertar',
    description:
      'Mides tu temperatura cada mañana antes de levantarte. Tras la ovulación sube unas décimas y se mantiene alta hasta la siguiente regla.',
    records: ['Temperatura al despertar', 'Sangrado'],
    usesMucus: null,
    usesTemp: true,
    note: 'La temperatura confirma la ovulación después de que ocurre; no la anticipa.',
  },
  {
    id: 'calendario',
    name: 'Calendario (contador de días)',
    short: 'Calendario',
    tagline: 'Contar los días del ciclo',
    description:
      'Registras cuándo empieza cada regla y la app calcula la duración de tus ciclos y una ventana fértil estimada a partir de tu historial.',
    records: ['Inicio y días de regla', 'Duración de los ciclos'],
    usesMucus: null,
    usesTemp: false,
    note: 'Es una estimación estadística, no una observación de tu cuerpo: es el método menos preciso, sobre todo con ciclos irregulares.',
  },
]

export const methodDef = (id: MethodId) => METHODS.find((m) => m.id === id)!

// ---------- Sangrado ----------
export const BLEEDING: { id: Bleeding; label: string; hint: string }[] = [
  { id: 'H', label: 'Abundante', hint: 'H' },
  { id: 'M', label: 'Moderado', hint: 'M' },
  { id: 'L', label: 'Ligero', hint: 'L' },
  { id: 'VL', label: 'Muy ligero', hint: 'VL · manchas' },
  { id: 'B', label: 'Café / marrón', hint: 'B' },
]

// ---------- Creighton ----------
export const CR_BASES: { id: CrBase; label: string; hint: string; group: 'seco' | 'moco' | 'lub' }[] = [
  { id: '0', label: 'Seco', hint: 'El papel raspa y se arruga', group: 'seco' },
  { id: '2', label: 'Húmedo sin lubricación', hint: 'Zona húmeda en el papel', group: 'seco' },
  { id: '2W', label: 'Mojado sin lubricación', hint: 'Papel muy mojado', group: 'seco' },
  { id: '4', label: 'Brillo sin lubricación', hint: 'Humedad con zonas brillosas', group: 'seco' },
  { id: '6', label: 'Pegajoso', hint: 'Estira hasta 0,5 cm', group: 'moco' },
  { id: '8', label: 'Ligoso', hint: 'Estira de 1 a 2 cm', group: 'moco' },
  { id: '10', label: 'Elástico', hint: 'Estira 2,5 cm o más', group: 'moco' },
  { id: '10DL', label: 'Húmedo con lubricación', hint: 'Sin moco que examinar', group: 'lub' },
  { id: '10SL', label: 'Brillo con lubricación', hint: 'Sin moco que examinar', group: 'lub' },
  { id: '10WL', label: 'Mojado con lubricación', hint: 'Sin moco que examinar', group: 'lub' },
]

export const CR_COLORS: { id: CrMod; label: string; desc: string }[] = [
  { id: 'K', label: 'Transparente', desc: 'Claro como cristal: se ve a través' },
  { id: 'C/K', label: 'Nublado / transparente', desc: 'En parte nublado, en parte claro' },
  { id: 'C', label: 'Nublado (blanco)', desc: 'Opaco o translúcido como niebla' },
  { id: 'Y', label: 'Amarillo', desc: 'Ligeramente amarillento' },
  { id: 'B', label: 'Café / marrón', desc: 'Sangre vieja en el flujo' },
  { id: 'R', label: 'Rojo', desc: 'Sangre fresca en el flujo' },
]
export const CR_CONSIST: { id: CrMod; label: string; desc: string }[] = [
  { id: 'P', label: 'Pastoso', desc: 'Como crema o loción; nunca estira' },
  { id: 'G', label: 'Gomoso', desc: 'Espeso, como pegamento a medio secar' },
]
export const CR_FREQ: { id: Freq; label: string }[] = [
  { id: 'X1', label: '1 vez' },
  { id: 'X2', label: '2 veces' },
  { id: 'X3', label: '3 veces' },
  { id: 'AD', label: 'Todo el día' },
]

const MOD_ORDER: CrMod[] = ['P', 'G', 'B', 'C', 'C/K', 'K', 'R', 'Y', 'L']
export const crNeedsMods = (b: CrBase) => b === '6' || b === '8' || b === '10'

export function crCode(e: DayEntry): string {
  const parts: string[] = []
  if (e.bleeding) parts.push(e.bleeding)
  if (e.cr) {
    const mods = crNeedsMods(e.cr.base) ? MOD_ORDER.filter((m) => e.cr!.mods.includes(m)).join('') : ''
    parts.push(e.cr.base + mods)
    if (e.cr.freq) parts.push(e.cr.freq)
  }
  return parts.join(' ')
}

// ---------- Billings / sintotérmico ----------
export const SENSATIONS: { id: Sensation; label: string; desc: string }[] = [
  { id: 'seca', label: 'Seca', desc: 'No se siente nada' },
  { id: 'humeda', label: 'Húmeda', desc: 'Ya no está seca' },
  { id: 'mojada', label: 'Mojada', desc: 'Claramente mojada' },
  { id: 'resbalosa', label: 'Resbalosa', desc: 'Lubricada, resbaladiza' },
]
export const APPEARANCES: { id: Appearance; label: string; desc: string }[] = [
  { id: 'nada', label: 'Nada visible', desc: 'No se ve moco' },
  { id: 'espeso', label: 'Espeso / opaco', desc: 'Blanco, cremoso, pegajoso o grumoso' },
  { id: 'claro', label: 'Transparente / elástico', desc: 'Como clara de huevo cruda' },
]

export function simpleCode(e: DayEntry): string {
  const parts: string[] = []
  if (e.bleeding) parts.push(e.bleeding)
  if (e.mucus) {
    const s = { seca: 'S', humeda: 'H', mojada: 'M', resbalosa: 'R' }[e.mucus.sensation]
    const a = { nada: '', espeso: 'o', claro: 't' }[e.mucus.appearance]
    parts.push(s + a)
  }
  return parts.join(' ')
}

export function describeEntry(e: DayEntry | undefined, method: MethodId): string {
  if (!e) return ''
  const out: string[] = []
  if (e.bleeding) out.push('Sangrado ' + BLEEDING.find((b) => b.id === e.bleeding)!.label.toLowerCase())
  if (method === 'creighton' && e.cr) {
    const b = CR_BASES.find((x) => x.id === e.cr!.base)!
    const mods = crNeedsMods(e.cr.base)
      ? e.cr.mods.map((m) =>
          m === 'L' ? 'lubricante' : ([...CR_COLORS, ...CR_CONSIST].find((x) => x.id === m)?.label.toLowerCase() ?? m),
        )
      : []
    out.push([b.label, ...mods].join(', '))
  }
  if ((method === 'billings' || method === 'sintotermico') && e.mucus) {
    out.push(
      `Sensación ${SENSATIONS.find((s) => s.id === e.mucus!.sensation)!.label.toLowerCase()}, ${APPEARANCES.find(
        (a) => a.id === e.mucus!.appearance,
      )!.label.toLowerCase()}`,
    )
  }
  if (e.temp != null) out.push(`${e.temp.toFixed(2).replace('.', ',')} °C${e.tempDisturbed ? ' (alterada)' : ''}`)
  return out.join(' · ')
}

export function codeFor(e: DayEntry | undefined, method: MethodId): string {
  if (!e) return ''
  if (method === 'creighton') return crCode(e)
  if (method === 'billings' || method === 'sintotermico') return simpleCode(e)
  if (method === 'temperatura') return [e.bleeding, e.temp != null ? e.temp.toFixed(2) : ''].filter(Boolean).join(' ')
  return e.bleeding ?? ''
}
