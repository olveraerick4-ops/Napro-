import type { LifeStage } from '../types'

export interface StageDef {
  id: LifeStage
  name: string
  short: string
  description: string
  /** Etiqueta del campo de fecha, si la etapa necesita una */
  dateLabel?: string
  /** Notas que se muestran en la guía y en «Hoy» */
  notes: string[]
  /** La app no calcula días fértiles / infértiles en esta etapa */
  noFertility?: boolean
  /** Los ciclos largos o irregulares son esperables: no se avisa por ellos */
  irregularExpected?: boolean
  /** El moco tipo Pico puede ir y venir: no se avisa por moco tras el Pico */
  variableMucusExpected?: boolean
}

export const STAGES: StageDef[] = [
  {
    id: 'regular',
    name: 'Ciclos regulares',
    short: 'Ciclos',
    description: 'Tienes reglas y quieres conocer tu ciclo, evitar o lograr un embarazo.',
    notes: [],
  },
  {
    id: 'buscando',
    name: 'Buscando embarazo',
    short: 'Buscando embarazo',
    description: 'Queréis concebir. La app destaca los días de mayor fertilidad y las señales que conviene revisar con un médico.',
    notes: [
      'Los días de mayor fertilidad son los de moco de más calidad y cantidad (tipo Pico) y los dos días siguientes.',
      'Si pasan 17 días o más desde el día Pico sin regla, haz una prueba de embarazo.',
    ],
  },
  {
    id: 'embarazo',
    name: 'Embarazo',
    short: 'Embarazo',
    description: 'Estás embarazada. La app deja de calcular días fértiles y te muestra las semanas de embarazo.',
    dateLabel: 'Día de la concepción (día Pico del ciclo en que te embarazaste)',
    noFertility: true,
    notes: [
      'La fecha de parto se calcula sumando 266 días al día de la concepción (el día Pico es la mejor estimación).',
      'Ante cualquier sangrado, dolor fuerte o pérdida de líquido, contacta con tu médico.',
    ],
  },
  {
    id: 'lactancia-total',
    name: 'Lactancia total',
    short: 'Lactancia total',
    description: 'El bebé se alimenta solo del pecho (salvo algún sorbo de agua).',
    dateLabel: 'Fecha del parto',
    irregularExpected: true,
    variableMucusExpected: true,
    notes: [
      'Empieza a registrar cuando el sangrado del posparto disminuya (hacia las 3 semanas).',
      'En lactancia total, las primeras 8 semanas (56 días) tras el parto se consideran infértiles.',
      'Después se aplican las instrucciones básicas de la fase pre-Pico, siempre al final del día.',
      'Al destetar es normal que el moco tipo Pico vaya y venga. Cuando vuelva la regla, pide cita con tu instructora.',
    ],
  },
  {
    id: 'lactancia-parcial',
    name: 'Lactancia parcial',
    short: 'Lactancia parcial',
    description: 'El bebé toma pecho y además otros alimentos o biberón.',
    dateLabel: 'Fecha del parto',
    irregularExpected: true,
    variableMucusExpected: true,
    notes: [
      'En lactancia parcial las primeras 8 semanas tras el parto no se consideran infértiles.',
      'Se recomienda un mes sin contacto genital para conocer bien tus observaciones.',
      'Se aplican las instrucciones básicas de la fase pre-Pico, siempre al final del día.',
    ],
  },
  {
    id: 'posparto',
    name: 'Posparto sin lactancia',
    short: 'Posparto',
    description: 'Has dado a luz y no das el pecho.',
    dateLabel: 'Fecha del parto',
    irregularExpected: true,
    notes: [
      'Sin lactancia no hay un periodo infértil automático: se han descrito ovulaciones desde el día 27 tras el parto.',
      'Empieza a registrar cuando disminuya el sangrado, hacia las 3 o 4 semanas.',
      'Las primeras 4 semanas de registro conviene evitar el contacto genital para ganar confianza en las observaciones.',
    ],
  },
  {
    id: 'tras-pildora',
    name: 'Tras dejar la píldora',
    short: 'Tras la píldora',
    description: 'Has dejado los anticonceptivos hormonales hace poco.',
    dateLabel: 'Fecha en que dejaste la píldora',
    irregularExpected: true,
    variableMucusExpected: true,
    notes: [
      'El primer ciclo tras dejarla puede ser más largo y la primera regla más abundante.',
      'Los primeros meses las fases antes y después del Pico pueden variar más de lo normal.',
      'Si pasan más de 6 meses sin regla, consulta a tu médico.',
    ],
  },
  {
    id: 'tras-perdida',
    name: 'Tras una pérdida',
    short: 'Tras una pérdida',
    description: 'Has tenido un aborto espontáneo o un embarazo ectópico.',
    dateLabel: 'Fecha de la pérdida',
    irregularExpected: true,
    notes: [
      'La ovulación puede volver en solo dos semanas.',
      'Empieza a registrar cuando disminuya el sangrado, normalmente a la semana.',
      'Tu instructora puede acompañaros en este momento. No estáis solos.',
    ],
  },
  {
    id: 'premenopausia',
    name: 'Premenopausia',
    short: 'Premenopausia',
    description: 'Tus ciclos empiezan a cambiar antes de la menopausia.',
    irregularExpected: true,
    variableMucusExpected: true,
    notes: [
      'Los ciclos pueden ser más cortos, irregulares o sin ovulación, con más «parches» de moco.',
      'La fase antes del Pico puede ser más corta: vigila el moco también durante la regla.',
      'Ante sangrado inusual, entre reglas, flujo continuo o de mal olor, consulta a tu médico.',
      'Se habla de menopausia cuando pasa un año sin regla.',
    ],
  },
  {
    id: 'menopausia',
    name: 'Menopausia',
    short: 'Menopausia',
    description: 'Ha pasado más de un año desde tu última regla.',
    noFertility: true,
    notes: ['Cualquier sangrado después de la menopausia debe consultarse con el médico.'],
  },
]

export const stageDef = (id: LifeStage | undefined) => STAGES.find((s) => s.id === id) ?? STAGES[0]
