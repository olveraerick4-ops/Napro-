export type MethodId = 'creighton' | 'billings' | 'sintotermico' | 'temperatura' | 'calendario'

export type Bleeding = 'H' | 'M' | 'L' | 'VL' | 'B'
export type CrBase = '0' | '2' | '2W' | '4' | '6' | '8' | '10' | '10DL' | '10SL' | '10WL'
export type CrMod = 'P' | 'G' | 'B' | 'C' | 'C/K' | 'K' | 'R' | 'Y' | 'L'
export type Freq = 'X1' | 'X2' | 'X3' | 'AD'

export type Sensation = 'seca' | 'humeda' | 'mojada' | 'resbalosa'
export type Appearance = 'nada' | 'espeso' | 'claro'

export interface DayEntry {
  date: string // YYYY-MM-DD
  bleeding?: Bleeding
  /** Marca el día 1 de un ciclo nuevo */
  periodStart?: boolean
  /** Creighton: Sistema de Registro de Flujo Vaginal */
  cr?: { base: CrBase; mods: CrMod[]; freq?: Freq }
  /** Billings / sintotérmico: sensación + apariencia */
  mucus?: { sensation: Sensation; appearance: Appearance }
  /** Temperatura basal en °C */
  temp?: number
  /** Temperatura alterada (fiebre, mala noche, alcohol…): no cuenta */
  tempDisturbed?: boolean
  intercourse?: boolean
  notes?: string
}

export interface Settings {
  onboarded: boolean
  method: MethodId
  country: string
  /** Calendario: duración del ciclo más corto / más largo conocidos */
  shortest?: number
  longest?: number
}

export interface AppData {
  settings: Settings
  entries: Record<string, DayEntry>
}
