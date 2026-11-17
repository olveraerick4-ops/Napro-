export interface Fact {
  title: string
  text: string
  source: string
}

/**
 * Datos objetivos sobre los métodos naturales, centrados en lo que aportan.
 * Cada uno lleva su fuente para poder comprobarlo.
 */
export const FACTS: Fact[] = [
  {
    title: 'Tu ventana fértil dura unos 6 días',
    text: 'El óvulo vive entre 12 y 24 horas, y los espermatozoides pueden sobrevivir hasta 5 días gracias al moco cervical fértil. Por eso en cada ciclo hay solo unos pocos días en los que es posible concebir, y tu cuerpo te avisa de ellos.',
    source: 'Wilcox AJ y cols., New England Journal of Medicine, 1995',
  },
  {
    title: 'El moco cervical trabaja para la vida',
    text: 'Antes de la ovulación, los estrógenos hacen que el moco se vuelva transparente y elástico. Ese moco nutre a los espermatozoides, los guía y los protege. Aprender a verlo es aprender el lenguaje de tu cuerpo.',
    source: 'Hilgers TW, Creighton Model FertilityCare System, cap. 3',
  },
  {
    title: 'El día Pico señala la ovulación',
    text: 'El último día de moco transparente, elástico o lubricante (el día Pico) coincide con la ovulación con mucha precisión. De los signos que puede observar una mujer, es el más estudiado y reproducible.',
    source: 'Hilgers TW, Creighton Model FertilityCare System, cap. 7',
  },
  {
    title: 'Muy eficaces cuando se aprenden bien',
    text: 'Con un uso correcto, el Modelo Creighton supera el 99 % de eficacia para espaciar los embarazos, y el método sintotérmico Sensiplan llega al 99,6 %. La clave es aprenderlo con una instructora y seguir sus instrucciones.',
    source: 'Hilgers TW, cap. 7 y 11; Frank-Herrmann P y cols., Human Reproduction, 2007',
  },
  {
    title: 'Sirven también para buscar un embarazo',
    text: 'Los mismos signos que permiten espaciar los embarazos ayudan a buscarlos. En parejas con fertilidad normal que usaron sus días de moco tipo Pico, el 76 % concibió en el primer ciclo.',
    source: 'Hilgers TW, Creighton Model FertilityCare System, cap. 7',
  },
  {
    title: 'Tu ciclo es un signo de salud',
    text: 'El Colegio Americano de Obstetras y Ginecólogos recomienda tratar el ciclo menstrual de las adolescentes como un signo vital, igual que el pulso o la tensión. A cualquier edad, una gráfica bien llevada es un registro de tu salud hormonal.',
    source: 'ACOG, Opinión del Comité n.º 651, 2015',
  },
  {
    title: 'Tu gráfica ayuda a tu médico',
    text: 'La duración de la fase después del Pico refleja la progesterona; la cantidad de moco, los estrógenos. Por eso la naprotecnología usa la gráfica para orientar estudios y tratamientos en el momento justo del ciclo.',
    source: 'Hilgers TW, Creighton Model FertilityCare System, cap. 9 y 10',
  },
  {
    title: 'La temperatura confirma la ovulación',
    text: 'Tras la ovulación, la progesterona sube tu temperatura basal entre 0,2 y 0,5 °C, y se mantiene alta hasta la siguiente regla. Es una señal sencilla y muy fiable de que la ovulación ya ocurrió.',
    source: 'Fisiología del ciclo menstrual: efecto térmico de la progesterona',
  },
  {
    title: 'Se adaptan a cada etapa de la vida',
    text: 'Funcionan con ciclos regulares o largos, en la lactancia, después de un parto, en la premenopausia y al dejar la píldora. Cada etapa tiene sus propias instrucciones.',
    source: 'Hilgers TW, Creighton Model FertilityCare System, apéndice A',
  },
  {
    title: 'Un proyecto de los dos',
    text: 'Para usar un método natural la pareja habla de su fertilidad y decide junta. Muchas parejas cuentan que mejoran su diálogo, su respeto mutuo y su forma de compartir la responsabilidad.',
    source: 'Hilgers TW, Creighton Model FertilityCare System, cap. 2',
  },
  {
    title: 'Décadas de investigación',
    text: 'El Método Billings nació en los años 50 en Melbourne, con los doctores John y Evelyn Billings. El Modelo Creighton se investiga desde 1976 en la Universidad de Creighton (Omaha) y dio origen a la naprotecnología.',
    source: 'WOOMB International; Hilgers TW, introducción',
  },
  {
    title: 'Se aprende en pocas semanas',
    text: 'El 90 % de las mujeres hace la rutina de observación en 30 segundos o menos. Con unas pocas sesiones de seguimiento la mayoría gana confianza en sus observaciones en uno o dos ciclos.',
    source: 'Hilgers TW, Creighton Model FertilityCare System, cap. 4 y 7',
  },
]

/** Un dato distinto cada día */
export const factOfDay = (date: string) => {
  const n = Number(date.replace(/-/g, '')) % FACTS.length
  return FACTS[n]
}
