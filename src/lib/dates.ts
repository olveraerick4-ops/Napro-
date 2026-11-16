export const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const today = () => iso(new Date())
export const addDays = (s: string, n: number) => {
  const d = parse(s)
  d.setDate(d.getDate() + n)
  return iso(d)
}
export const diffDays = (a: string, b: string) => Math.round((parse(b).getTime() - parse(a).getTime()) / 86400000)

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
export const fmtShort = (s: string) => {
  const d = parse(s)
  return `${d.getDate()} ${MESES[d.getMonth()]}`
}
export const fmtDM = (s: string) => {
  const d = parse(s)
  return `${d.getDate()}/${d.getMonth() + 1}`
}
export const fmtLong = (s: string) => {
  const d = parse(s)
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

/** Número con coma decimal */
export const num = (n: number, digits?: number) =>
  n.toLocaleString('es-ES', digits != null ? { minimumFractionDigits: digits, maximumFractionDigits: digits } : undefined)
