import type { AppData } from '../types'
import type { Cycle } from './engine'
import type { Insight } from './insights'
import type { Mood } from '../components/Mascot'
import { addDays, diffDays, today } from './dates'
import { methodDef } from './methods'
import { stageDef } from './stages'

export interface CompanionMsg {
  mood: Mood
  title?: string
  text: string
  action?: 'register' | 'signals' | 'clinics' | 'stage' | 'facts'
}

/** Lo que Alba dice en «Hoy», según el momento del ciclo, la etapa y lo registrado. */
export function companionMessage(data: AppData, cycles: Cycle[], signals: Insight[], now: string = today(), hour = new Date().getHours()): CompanionMsg {
  const method = data.settings.method
  const def = methodDef(method)
  const stage = stageDef(data.settings.stage)
  const days = new Map(cycles.flatMap((c) => c.days).map((d) => [d.date, d]))
  const t = days.get(now)
  const y = days.get(addDays(now, -1))
  const hasAny = Object.keys(data.entries).length > 0

  const urgent = signals.find((s) => s.level === 'urgente')
  if (urgent)
    return { mood: 'cuidado', title: urgent.title, text: 'He visto algo en tu registro que conviene que valore tu médico pronto. No te preocupes de más, pero no lo dejes pasar.', action: 'clinics' }

  if (!hasAny)
    return {
      mood: 'hola',
      title: '¡Hola! Soy Alba',
      text: `Te acompaño en tu ${def.short === 'Calendario' ? 'calendario' : 'método ' + def.short}. Empieza registrando hoy: yo te iré guiando día a día.`,
      action: 'register',
    }

  if (stage.id === 'embarazo') {
    const since = data.settings.stageSince
    if (!since) return { mood: 'pensando', text: 'Si me dices el día de la concepción, te digo en qué semana estás y la fecha probable de parto.', action: 'stage' }
    const w = Math.floor((diffDays(since, now) + 14) / 7)
    return { mood: 'fiesta', title: `¡Semana ${w}!`, text: 'Sigue tus revisiones con tu médico. Aquí puedes seguir anotando cómo te sientes.' }
  }

  if (!t?.entry) {
    if (hour >= 18)
      return { mood: 'pensando', title: 'Antes de dormir', text: 'Haz tu última observación del día y anota lo más fértil que hayas visto. ¡Solo te lleva un minuto!', action: 'register' }
    if (def.usesTemp && hour < 12)
      return { mood: 'hola', title: '¡Buenos días!', text: 'Si aún no te has levantado, es el momento de tomarte la temperatura.', action: 'register' }
    return {
      mood: 'feliz',
      text: def.usesMucus ? 'Recuerda observar cada vez que vayas al baño. Al final del día registras lo más fértil.' : 'Cuando puedas, registra el día de hoy.',
      action: 'register',
    }
  }

  if (t.entry.periodStart) return { mood: 'feliz', title: 'Empieza un ciclo nuevo', text: 'Cada ciclo es una oportunidad de conocerte un poco más. ¡Vamos allá!' }

  if (y?.mark === 'P')
    return { mood: 'fiesta', title: '¡Ayer fue tu día Pico!', text: 'Tu cuerpo te ha mostrado su momento más fértil. Desde hoy cuentas 1, 2, 3.' }
  if (t.mark === '1' || t.mark === '2' || t.mark === '3')
    return {
      mood: 'pensando',
      title: `Cuenta de 3: día ${t.mark}`,
      text: t.mark === '3' ? 'Último día de la cuenta. Si todo sigue seco, mañana termina esta fase fértil al final del día.' : 'Seguimos dentro de la fase fértil. Sigue observando con calma.',
    }
  if (t.cls === 'peak')
    return stage.id === 'buscando'
      ? { mood: 'fiesta', title: 'Hoy es de tus días más fértiles', text: 'Moco tipo Pico: es un gran momento si buscáis embarazo.' }
      : { mood: 'pensando', title: 'Moco tipo Pico', text: 'Tu cuerpo se prepara para ovular. Mañana sabremos si hoy fue el día Pico.' }

  const consult = signals.filter((s) => s.level === 'consultar')
  if (consult.length)
    return {
      mood: 'cuidado',
      title: consult.length === 1 ? 'Una cosa que revisar' : `${consult.length} cosas que revisar`,
      text: 'En tu gráfica veo patrones que vale la pena comentar con tu instructora o un médico de naprotecnología.',
      action: 'signals',
    }

  const streak = (() => {
    let n = 0
    for (let d = now; data.entries[d]; d = addDays(d, -1)) n++
    return n
  })()
  if (streak >= 7) return { mood: 'fiesta', title: `¡${streak} días seguidos!`, text: 'Registrar con constancia es lo que hace que tu gráfica sea fiable. ¡Muy bien!' }

  return { mood: 'feliz', title: 'Día registrado', text: '¿Sabías que tu gráfica cuenta mucho sobre tu salud? Te dejo un dato debajo.', action: 'facts' }
}
