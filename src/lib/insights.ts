import type { AppData } from '../types'
import type { Cycle } from './engine'
import { diffDays, fmtShort, today } from './dates'
import { methodDef } from './methods'
import { stageDef } from './stages'

export type InsightLevel = 'urgente' | 'consultar' | 'info'

export interface Insight {
  id: string
  level: InsightLevel
  title: string
  /** Qué se ve en la gráfica */
  seen: string
  /** Con qué se asocia, según la guía de interpretación del Modelo Creighton */
  meaning: string
  /** Ciclos o días donde se observa */
  evidence: string[]
}

const name = (c: Cycle) => `Ciclo ${c.index} (${fmtShort(c.start)})`

/** Primer tramo de sangrado del ciclo (la regla) */
function periodRun(c: Cycle): number {
  let k = 0
  while (k < c.days.length && c.days[k].entry?.bleeding) k++
  return k
}

/** Tramo final de sangrado ligero, muy ligero o café justo antes de la siguiente regla */
function premenstrualRun(c: Cycle): number {
  if (!c.complete) return 0
  let k = 0
  for (let i = c.days.length - 1; i >= periodRun(c); i--) {
    const b = c.days[i].entry?.bleeding
    if (b === 'L' || b === 'VL' || b === 'B') k++
    else break
  }
  return k
}

const isMucus = (cls: string) => cls === 'peak' || cls === 'nonpeak'

export function insights(data: AppData, cycles: Cycle[], now: string = today()): Insight[] {
  const method = data.settings.method
  const def = methodDef(method)
  const stage = stageDef(data.settings.stage)
  const since = data.settings.stageSince
  const out: Insight[] = []
  const add = (i: Insight) => i.evidence.length && out.push(i)

  // ---------- etapas con avisos propios ----------
  const bleedingSince = (from?: string) =>
    Object.values(data.entries)
      .filter((e) => e.bleeding && (!from || e.date >= from))
      .map((e) => e.date)
      .sort()

  if (stage.id === 'embarazo') {
    const b = bleedingSince(since)
    add({
      id: 'sangrado-embarazo',
      level: 'urgente',
      title: 'Sangrado durante el embarazo',
      seen: 'Has registrado sangrado durante el embarazo.',
      meaning: 'Cualquier sangrado en el embarazo debe valorarlo tu médico cuanto antes, aunque sea poco.',
      evidence: b.slice(-5).map(fmtShort),
    })
    return out
  }
  if (stage.id === 'menopausia') {
    const b = bleedingSince(since)
    add({
      id: 'sangrado-menopausia',
      level: 'urgente',
      title: 'Sangrado después de la menopausia',
      seen: 'Has registrado sangrado estando en la menopausia.',
      meaning: 'Cualquier sangrado tras la menopausia debe consultarse con el médico.',
      evidence: b.slice(-5).map(fmtShort),
    })
    return out
  }
  if (stage.id === 'tras-pildora' && since && diffDays(since, now) > 180) {
    const starts = Object.values(data.entries).filter((e) => e.periodStart && e.date > since)
    if (!starts.length)
      add({
        id: 'pildora-sin-regla',
        level: 'consultar',
        title: 'Más de 6 meses sin regla tras dejar la píldora',
        seen: `Dejaste la píldora el ${fmtShort(since)} y no has registrado ninguna regla desde entonces.`,
        meaning: 'La falta de ovulación que se prolonga más de seis meses tras dejar la píldora puede ser causa de infertilidad y conviene que la valore un médico.',
        evidence: [`${diffDays(since, now)} días`],
      })
  }

  const done = cycles.filter((c) => c.complete && c.hasStart)
  const usesMucus = !!def.usesMucus
  const phase = usesMucus ? 'post-Pico' : 'lútea (tras la subida de temperatura)'

  // ---------- fase post-Pico ----------
  const withPost = done.filter((c) => c.postPeak !== null)
  add({
    id: 'post-corta',
    level: 'consultar',
    title: `Fase ${usesMucus ? 'post-Pico' : 'lútea'} corta`,
    seen: `La fase ${phase} ha durado 8 días o menos.`,
    meaning:
      'Puede indicar que la progesterona que se produce tras la ovulación no es suficiente. Se asocia con más riesgo de aborto espontáneo si hay embarazo, y existen tratamientos que se pueden empezar antes de buscarlo.',
    evidence: withPost.filter((c) => c.postPeak! <= 8).map((c) => `${name(c)}: ${c.postPeak} días`),
  })
  add({
    id: 'post-larga',
    level: 'consultar',
    title: `Fase ${usesMucus ? 'post-Pico' : 'lútea'} larga`,
    seen: `La fase ${phase} ha durado 17 días o más.`,
    meaning:
      'Se ve en algunas formas de infertilidad (por ejemplo, cuando el folículo no llega a romperse), al acercarse la menopausia o en los primeros años tras la primera regla. También puede deberse a haber identificado mal el día Pico.',
    evidence: withPost.filter((c) => c.postPeak! >= 17).map((c) => `${name(c)}: ${c.postPeak} días`),
  })
  if (withPost.length >= 2 && !stage.irregularExpected) {
    const v = withPost.map((c) => c.postPeak!)
    const range = Math.max(...v) - Math.min(...v)
    if (range >= 4)
      add({
        id: 'post-variable',
        level: 'consultar',
        title: `Fase ${usesMucus ? 'post-Pico' : 'lútea'} variable`,
        seen: `Entre tus ciclos, la fase ${phase} cambia ${range} días (de ${Math.min(...v)} a ${Math.max(...v)}). Lo habitual es que no varíe más de 2 o 3 días.`,
        meaning:
          'Puede reflejar inestabilidad en la producción de progesterona tras la ovulación. Hay tratamientos que la estabilizan y conviene valorarlo antes de buscar embarazo.',
        evidence: withPost.map((c) => `${name(c)}: ${c.postPeak} días`),
      })
  }

  // ---------- embarazo posible en el ciclo actual ----------
  const cur = cycles[cycles.length - 1]
  if (cur && !cur.complete && cur.hasStart) {
    const ref = cur.peakIdx ?? (cur.shift ? cur.shift.firstHigh - 1 : null)
    const lastIdx = cur.days.findIndex((d) => d.date === now)
    if (ref !== null && lastIdx - ref >= 17)
      add({
        id: 'posible-embarazo',
        level: 'info',
        title: 'Podría ser un embarazo',
        seen: `Han pasado ${lastIdx - ref} días desde el ${usesMucus ? 'día Pico' : 'inicio de la subida de temperatura'} y todavía no ha llegado la regla.`,
        meaning: 'Con 17 días o más tras el Pico sin regla, se recomienda hacer una prueba de embarazo.',
        evidence: [name(cur)],
      })
  }

  // ---------- duración del ciclo ----------
  add({
    id: 'ciclos-largos',
    level: stage.irregularExpected ? 'info' : 'consultar',
    title: 'Ciclos largos',
    seen: 'Hay ciclos de más de 38 días.',
    meaning: stage.irregularExpected
      ? `En tu etapa (${stage.name.toLowerCase()}) los ciclos largos son frecuentes. Si se mantienen, coméntalo con tu instructora.`
      : 'La causa más frecuente es el síndrome de ovario poliquístico, en el que la ovulación no llega con regularidad. Se asocia con más problemas de fertilidad y merece una valoración médica.',
    evidence: done.filter((c) => c.length > 38).map((c) => `${name(c)}: ${c.length} días`),
  })

  if (usesMucus) {
    const withPeak = done.filter((c) => c.peakIdx !== null)
    // ---------- día Pico tardío / temprano ----------
    add({
      id: 'pico-tardio',
      level: 'info',
      title: 'Día Pico tardío',
      seen: 'El día Pico ha llegado el día 18 del ciclo o más tarde.',
      meaning: 'Puede asociarse con ovulación retrasada por estrés o con una variante del síndrome de ovario poliquístico.',
      evidence: withPeak.filter((c) => c.peakIdx! + 1 >= 18).map((c) => `${name(c)}: Pico el día ${c.peakIdx! + 1}`),
    })
    if (stage.id !== 'premenopausia')
      add({
        id: 'prepico-corta',
        level: 'info',
        title: 'Fase pre-Pico corta',
        seen: 'El día Pico ha llegado el día 10 del ciclo o antes.',
        meaning: 'Indica una ovulación temprana. Ten presente que el moco puede empezar ya durante la regla: obsérvalo también esos días.',
        evidence: withPeak.filter((c) => c.peakIdx! + 1 <= 10).map((c) => `${name(c)}: Pico el día ${c.peakIdx! + 1}`),
      })

    // ---------- cantidad de moco ----------
    const mucusBefore = (c: Cycle) => c.days.slice(0, c.peakIdx! + 1).filter((d) => isMucus(d.cls)).length
    const runToPeak = (c: Cycle) => {
      let k = 0
      for (let i = c.peakIdx!; i >= 0 && (isMucus(c.days[i].cls) || c.days[i].cls === 'bleed'); i--) k++
      return k
    }
    add({
      id: 'moco-limitado',
      level: 'consultar',
      title: 'Poco moco antes de la ovulación',
      seen: 'En algunos ciclos solo has registrado 1 o 2 días de moco antes del día Pico (ciclo de moco limitado).',
      meaning:
        'Puede estar relacionado con una producción baja de estrógenos alrededor de la ovulación, o con pocos receptores de estrógeno en el cuello del útero. Se asocia con ovulaciones alteradas, infertilidad y síndrome premenstrual.',
      evidence: withPeak.filter((c) => mucusBefore(c) <= 2).map((c) => `${name(c)}: ${mucusBefore(c)} días de moco`),
    })
    add({
      id: 'moco-largo',
      level: 'info',
      title: 'Ciclo de moco largo',
      seen: 'Has tenido más de 8 días seguidos de moco hasta el día Pico.',
      meaning: 'Puede deberse a estrés, puntual o mantenido, y a veces a una alteración hormonal.',
      evidence: withPeak.filter((c) => runToPeak(c) > 8).map((c) => `${name(c)}: ${runToPeak(c)} días`),
    })
    const recorded = (c: Cycle) => c.days.filter((d) => d.entry).length
    add({
      id: 'ciclo-seco',
      level: 'consultar',
      title: 'Ciclo seco',
      seen: 'Hay ciclos completos sin ningún día de moco.',
      meaning:
        'Es poco frecuente con una fertilidad normal. Suele deberse a una producción muy baja de estrógenos antes de la ovulación o a una alteración de la ovulación. También puede ocurrir tras tratamientos o cirugía del cuello del útero, o con algunos medicamentos como los antihistamínicos.',
      evidence: done
        .filter((c) => recorded(c) >= c.length * 0.7 && !c.days.some((d) => isMucus(d.cls)))
        .map((c) => `${name(c)}: ${c.length} días sin moco`),
    })

    // ---------- moco tras el Pico ----------
    if (!stage.variableMucusExpected) {
      const postMucus = (c: Cycle) => c.days.slice(c.peakIdx! + 4).filter((d) => d.cls === 'nonpeak').length
      add({
        id: 'moco-post-pico',
        level: 'consultar',
        title: 'Moco después del Pico',
        seen: 'Después del día Pico y su cuenta de 3 sigues registrando moco varios días.',
        meaning: data.settings.yellowStamps
          ? 'Si es moco cervical, suele indicar una inflamación leve del cuello del útero, frecuente tras un parto o tras dejar la píldora. Tu instructora te indicará cuándo usar estampas amarillas.'
          : 'Si es moco cervical, suele indicar una inflamación leve del cuello del útero, frecuente tras un parto o tras dejar la píldora. Tiene un tratamiento sencillo. Tu instructora puede indicarte el uso de estampas amarillas.',
        evidence: [...withPeak, ...(cur && !cur.complete && cur.peakIdx !== null ? [cur] : [])]
          .filter((c) => postMucus(c) >= 3)
          .map((c) => `${name(c)}: ${postMucus(c)} días`),
      })
      const peaks = (c: Cycle) => c.days.filter((d) => d.mark === 'P').length
      add({
        id: 'varios-picos',
        level: 'info',
        title: 'Moco tipo Pico que va y viene',
        seen: 'En un mismo ciclo el moco tipo Pico aparece, desaparece y vuelve.',
        meaning:
          'Ocurre cuando el cuerpo intenta ovular y los estrógenos suben y bajan. Es habitual en la lactancia, al dejar la píldora o en ciclos sin ovulación. Sigue la regla: en caso de duda, día fértil y cuenta de 3.',
        evidence: cycles.filter((c) => peaks(c) >= 2).map((c) => `${name(c)}: ${peaks(c)} picos`),
      })
    }

    // ---------- 2W frecuente (solo Creighton) ----------
    if (method === 'creighton') {
      const w = (c: Cycle) => c.days.filter((d) => d.entry?.cr?.base === '2W').length
      add({
        id: '2w-frecuente',
        level: 'consultar',
        title: 'Muchos días «2W» (mojado sin lubricación)',
        seen: 'Has registrado «2W» con frecuencia a lo largo del ciclo.',
        meaning: 'Puede indicar una infección del cuello del útero (por ejemplo, por estreptococo del grupo B). Se diagnostica con un cultivo y se trata con antibióticos. Es especialmente importante si buscáis embarazo.',
        evidence: cycles.filter((c) => w(c) >= 5).map((c) => `${name(c)}: ${w(c)} días`),
      })
    }
  }

  // ---------- sangrados ----------
  const started = cycles.filter((c) => c.hasStart)
  const brownTail = (c: Cycle) => {
    const run = periodRun(c)
    let k = 0
    for (let i = run - 1; i >= 0 && c.days[i].entry?.bleeding === 'B'; i--) k++
    return k
  }
  add({
    id: 'cafe-final',
    level: 'consultar',
    title: 'Sangrado café al final de la regla',
    seen: 'La regla termina con 2 días o más de sangrado café o negro.',
    meaning: 'Suele deberse a una producción baja de progesterona en el ciclo anterior. A veces se relaciona con adenomiosis u otras alteraciones del endometrio que conviene descartar.',
    evidence: started.filter((c) => brownTail(c) >= 2).map((c) => `${name(c)}: ${brownTail(c)} días`),
  })
  add({
    id: 'premenstrual',
    level: 'consultar',
    title: 'Sangrado premenstrual',
    seen: 'Antes de la regla hay 3 días o más de manchado, sangrado ligero o café.',
    meaning: 'Se asocia con una caída de la progesterona y es más frecuente en mujeres con infertilidad, abortos espontáneos o síndrome premenstrual.',
    evidence: done.filter((c) => premenstrualRun(c) >= 3).map((c) => `${name(c)}: ${premenstrualRun(c)} días`),
  })
  const heavy = (c: Cycle) => c.days.slice(0, periodRun(c)).filter((d) => d.entry?.bleeding === 'H').length
  add({
    id: 'regla-abundante',
    level: 'consultar',
    title: 'Reglas abundantes',
    seen: 'Has registrado 4 días o más de sangrado abundante en una misma regla.',
    meaning: 'Si necesitas cambiar la protección cada 2 horas o menos, suele haber una causa orgánica (como miomas o adenomiosis). Consulta a tu médico.',
    evidence: started.filter((c) => heavy(c) >= 4).map((c) => `${name(c)}: ${heavy(c)} días abundantes`),
  })
  const light = (c: Cycle) => {
    const p = c.days.slice(0, periodRun(c))
    return p.length >= 2 && !p.some((d) => d.entry?.bleeding === 'H') && p.filter((d) => d.entry?.bleeding === 'M').length <= 2
  }
  add({
    id: 'regla-ligera',
    level: 'info',
    title: 'Reglas ligeras',
    seen: 'Algunas reglas no tienen ningún día abundante y como mucho 1 o 2 días moderados.',
    meaning: 'Pueden estar relacionadas con una alteración hormonal y suelen ir precedidas de un ciclo con poco moco.',
    evidence: started.filter(light).map((c) => name(c)),
  })
  const mid = (c: Cycle) => {
    const from = periodRun(c)
    const to = c.days.length - premenstrualRun(c)
    return c.days.slice(from, to).filter((d) => d.entry?.bleeding).map((d) => d.date)
  }
  add({
    id: 'sangrado-intermedio',
    level: 'consultar',
    title: 'Sangrado entre reglas',
    seen: 'Has registrado sangrado a mitad de ciclo, fuera de la regla.',
    meaning:
      (stage.id === 'premenopausia' ? 'En la premenopausia, cualquier sangrado entre reglas debe verlo el médico. ' : '') +
      'Si aparece al empezar el moco puede deberse a un pólipo del endometrio. Para el método, un sangrado inusual se considera día fértil más 3 días.',
    evidence: started.flatMap((c) => (mid(c).length ? [`${name(c)}: ${mid(c).map(fmtShort).join(', ')}`] : [])),
  })

  const order: Record<InsightLevel, number> = { urgente: 0, consultar: 1, info: 2 }
  return out.sort((a, b) => order[a.level] - order[b.level])
}
