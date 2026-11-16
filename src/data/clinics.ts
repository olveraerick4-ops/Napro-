export interface Clinic {
  name: string
  country: string // código ISO o 'INT'
  city: string
  kind: 'Clínica / médicos' | 'Instructoras' | 'Directorio' | 'Organización'
  methods: string[]
  description: string
  web?: string
  phone?: string
  email?: string
}

/** Fecha de la última revisión manual de este listado */
export const CLINICS_REVIEWED = 'noviembre de 2026'

export const COUNTRIES: Record<string, string> = {
  ES: 'España',
  MX: 'México',
  AR: 'Argentina',
  CO: 'Colombia',
  PY: 'Paraguay',
  INT: 'Internacional',
}

// Solo organizaciones con web pública propia. Para añadir una, copia un bloque y rellénalo.
export const CLINICS: Clinic[] = [
  {
    name: 'Fertilitas',
    country: 'ES',
    city: 'Madrid (sede) · Barcelona · Valencia · Málaga · Pamplona · videoconsulta',
    kind: 'Clínica / médicos',
    methods: ['NaProTecnología', 'Creighton'],
    description: 'Ginecólogos formados en naprotecnología y monitoras del Modelo Creighton. Atienden en toda España por telemedicina.',
    web: 'https://fertilitas.es',
    phone: '+34 911 278 795',
  },
  {
    name: 'Life Fertility Care Spain',
    country: 'ES',
    city: 'España',
    kind: 'Clínica / médicos',
    methods: ['NaProTecnología', 'Creighton'],
    description: 'Acompañamiento en naprotecnología para parejas con dificultad para concebir.',
    web: 'https://lifefertilitycare.es',
    phone: '+34 630 850 134',
    email: 'info@lifefertilitycare.es',
  },
  {
    name: 'FertilityCare España',
    country: 'ES',
    city: 'Madrid',
    kind: 'Instructoras',
    methods: ['Creighton', 'NaProTecnología'],
    description: 'Enseñanza del Modelo Creighton y derivación a médicos de naprotecnología.',
    web: 'https://fertilitycare.es',
  },
  {
    name: 'Naprotec',
    country: 'ES',
    city: 'En línea · deriva a monitoras por país',
    kind: 'Organización',
    methods: ['NaProTecnología', 'Creighton'],
    description: 'Información en español sobre naprotecnología y contacto con monitoras y médicos de distintos países.',
    web: 'https://www.naprotec.org',
    email: 'hola@naprotec.org',
  },
  {
    name: 'Clínica Napro',
    country: 'MX',
    city: 'Puebla',
    kind: 'Clínica / médicos',
    methods: ['NaProTecnología', 'Creighton'],
    description: 'Consulta de ginecología y obstetricia con enfoque de naprotecnología.',
    web: 'http://www.clinicanapro.mx',
    phone: '+52 222 225 7534',
    email: 'contacto@clinicanapro.mx',
  },
  {
    name: 'FertilityCare México',
    country: 'MX',
    city: 'Directorio por estados',
    kind: 'Directorio',
    methods: ['Creighton', 'NaProTecnología'],
    description: 'Listado de instructoras del Modelo Creighton y médicos por estado de la República.',
    web: 'http://fertilitycaremexico.com',
  },
  {
    name: 'FertilityCare Argentina',
    country: 'AR',
    city: 'CABA y otras zonas · presencial y en línea',
    kind: 'Instructoras',
    methods: ['Creighton', 'NaProTecnología'],
    description: 'Instructoras del Modelo Creighton por zona; orientan hacia médicos de naprotecnología.',
    web: 'https://fertilitycareargentina.com.ar',
    email: 'info@fertilitycareargentina.com.ar',
  },
  {
    name: 'Spera FertilityCare',
    country: 'CO',
    city: 'Colombia',
    kind: 'Instructoras',
    methods: ['Creighton', 'NaProTecnología'],
    description: 'Centro FertilityCare de la Fundación Derecho a Nacer.',
    web: 'https://sperafertilitycare.co',
    phone: '+57 316 138 4831',
    email: 'info@sperafertilitycare.co',
  },
  {
    name: 'Naprotech',
    country: 'CO',
    city: 'Colombia',
    kind: 'Clínica / médicos',
    methods: ['NaProTecnología'],
    description: 'Clínica de fertilidad con enfoque de naprotecnología.',
    web: 'https://naprotech.co',
    phone: '+57 324 454 7272',
  },
  {
    name: 'iCARE FertilityCare Services',
    country: 'PY',
    city: 'Paraguay',
    kind: 'Instructoras',
    methods: ['Creighton', 'NaProTecnología'],
    description: 'Servicios FertilityCare y enseñanza del Modelo Creighton.',
    web: 'https://www.fertilitycare.com.py',
  },
  {
    name: 'Saint Paul VI Institute',
    country: 'INT',
    city: 'Omaha, Nebraska (EE. UU.)',
    kind: 'Organización',
    methods: ['NaProTecnología', 'Creighton'],
    description: 'Instituto fundador del Modelo Creighton y de la NaProTecnología; forma a los médicos consultores de todo el mundo.',
    web: 'https://saintpaulvi.com',
  },
  {
    name: 'FertilityCare Centers International',
    country: 'INT',
    city: 'Buscador mundial de centros',
    kind: 'Directorio',
    methods: ['Creighton', 'NaProTecnología'],
    description: 'Directorio oficial de centros FertilityCare, instructoras y médicos consultores por país.',
    web: 'https://fertilitycare.org',
  },
  {
    name: 'WOOMB International',
    country: 'INT',
    city: 'Red mundial',
    kind: 'Directorio',
    methods: ['Billings'],
    description: 'Organización mundial del Método de Ovulación Billings; contacto con instructoras acreditadas en cada país.',
    web: 'https://woombinternational.org',
  },
]
