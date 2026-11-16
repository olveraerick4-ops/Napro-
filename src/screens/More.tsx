import { useRef, useState } from 'react'
import type { MethodId } from '../types'
import { APPEARANCES, BLEEDING, CR_BASES, CR_COLORS, CR_CONSIST, CR_FREQ, SENSATIONS, methodDef } from '../lib/methods'
import { getData, isValidBackup, replaceAll, resetAll, setSettings, useData } from '../lib/store'
import { demoData } from '../data/demo'
import { exportBackup } from '../lib/export'
import { BaseArt, STAMP_COLORS, Stamp, Swatch } from '../components/art'
import { MethodPicker } from './Onboarding'

function Guide({ method }: { method: MethodId }) {
  const def = methodDef(method)
  return (
    <div className="guide">
      <p>{def.description}</p>
      {method === 'creighton' && (
        <>
          <h4>Los tres pasos de cada observación</h4>
          <ol>
            <li><b>Sentir</b>: al limpiar con papel doblado, de delante hacia atrás, fíjate en la sensación: seca, suave o lubricante.</li>
            <li><b>Observar</b>: mira el papel. ¿Hay algo?</li>
            <li><b>Tocar</b>: si hay moco, tómalo entre el pulgar y el índice y estíralo; míralo a la altura de los ojos.</li>
          </ol>
          <p>Hazlo cada vez que vayas al baño (antes y después) y antes de acostarte. Al final del día anota solo lo <b>más fértil</b> que hayas visto.</p>
          <h4>Sangrado</h4>
          <ul className="codes">{BLEEDING.map((b) => <li key={b.id}><span className="code-pill">{b.id}</span> {b.label}</li>)}</ul>
          <h4>Observaciones</h4>
          <div className="guide-grid">
            {CR_BASES.map((b) => (
              <div key={b.id} className="guide-item">
                <BaseArt base={b.id} />
                <span><span className="code-pill">{b.id}</span> <b>{b.label}</b><small>{b.hint}</small></span>
              </div>
            ))}
          </div>
          <h4>Tabla de colores y consistencia</h4>
          <div className="guide-grid">
            {[...CR_COLORS, ...CR_CONSIST].map((c) => (
              <div key={c.id} className="guide-item">
                <Swatch mod={c.id} />
                <span><span className="code-pill">{c.id}</span> <b>{c.label}</b><small>{c.desc}</small></span>
              </div>
            ))}
            <div className="guide-item"><span className="swatch swatch-none" /><span><span className="code-pill">L</span> <b>Lubricante</b><small>El papel se desliza con facilidad</small></span></div>
          </div>
          <h4>Frecuencia</h4>
          <ul className="codes">{CR_FREQ.map((f) => <li key={f.id}><span className="code-pill">{f.id}</span> {f.label}</li>)}</ul>
          <h4>Moco tipo Pico y día Pico</h4>
          <p>Es moco <b>tipo Pico</b> el que es transparente, elástico (2,5 cm o más) o lubricante: basta una de las tres cosas. El <b>día Pico</b> es el último día en que aparece. Después se cuentan tres días (1, 2, 3).</p>
          <p>Ejemplos: <span className="code-pill">0 AD</span> seco todo el día · <span className="code-pill">6C X1</span> pegajoso nublado, una vez · <span className="code-pill">10KL AD</span> elástico, transparente y lubricante todo el día.</p>
        </>
      )}
      {method === 'billings' && (
        <>
          <h4>Qué observar</h4>
          <p>Durante el día, mientras haces tu vida normal, presta atención a la <b>sensación en la vulva</b>. No hace falta tocar ni buscar el moco. Por la noche anota la sensación y lo que hayas visto.</p>
          <ul className="codes">{SENSATIONS.map((s) => <li key={s.id}><b>{s.label}</b>: {s.desc.toLowerCase()}</li>)}</ul>
          <ul className="codes">{APPEARANCES.map((s) => <li key={s.id}><b>{s.label}</b>: {s.desc.toLowerCase()}</li>)}</ul>
          <h4>Día Cúspide (Pico)</h4>
          <p>Es el último día de sensación resbalosa. Se reconoce al día siguiente, cuando la sensación cambia. Después se cuentan tres días.</p>
        </>
      )}
      {(method === 'sintotermico' || method === 'temperatura') && (
        <>
          <h4>Cómo medir la temperatura</h4>
          <ul>
            <li>Al despertar, antes de levantarte, hablar o beber.</li>
            <li>Siempre a la misma hora y con el mismo termómetro (mejor de dos decimales).</li>
            <li>Si has dormido poco, tienes fiebre o bebiste alcohol, marca la medición como «alterada».</li>
          </ul>
          <h4>Regla «3 sobre 6»</h4>
          <p>La subida queda confirmada cuando tres temperaturas seguidas son más altas que las seis anteriores, y la tercera supera a la más alta de esas seis en al menos 0,2 °C. La app dibuja esa «línea base» en la gráfica.</p>
          {method === 'sintotermico' && <p>Además se anota el moco. La fase infértil posterior empieza cuando se cumplen las dos cosas: subida confirmada y tres días tras el Pico del moco.</p>}
        </>
      )}
      {method === 'calendario' && (
        <>
          <h4>Cómo funciona</h4>
          <p>Marca el primer día de cada regla. Con tus ciclos anteriores se estima la ventana fértil: <b>ciclo más corto − 18</b> hasta <b>ciclo más largo − 11</b>. Sin historial se usa la ventana estándar de los días 8 a 19, pensada para ciclos de 26 a 32 días.</p>
          <p>Es una estimación: no observa lo que pasa en tu cuerpo este ciclo.</p>
        </>
      )}
      {methodDef(method).usesMucus && (
        <>
          <h4>Estampas</h4>
          <ul className="legend">
            {(['red', 'green', 'white-baby', 'green-baby'] as const).map((s) => <li key={s}><Stamp kind={s} size={22} /> {STAMP_COLORS[s].label}</li>)}
          </ul>
        </>
      )}
      <p className="muted small">{def.note}</p>
    </div>
  )
}

export function More() {
  const data = useData()
  const s = data.settings
  const [open, setOpen] = useState<string | null>('guia')
  const [msg, setMsg] = useState('')
  const [confirmDel, setConfirmDel] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const hasEntries = Object.keys(data.entries).length > 0
  const toggle = (k: string) => setOpen(open === k ? null : k)

  const onFile = async (f: File | undefined) => {
    if (!f) return
    try {
      const parsed = JSON.parse(await f.text())
      if (!isValidBackup(parsed)) throw new Error('formato')
      replaceAll({ ...parsed, settings: { ...parsed.settings, onboarded: true } })
      setMsg('Copia restaurada.')
    } catch {
      setMsg('Ese archivo no es una copia de seguridad de Aurora.')
    }
  }

  // función normal (no componente) para que los campos no pierdan el foco al re-renderizar
  const section = (id: string, title: string, children: React.ReactNode) => (
    <section className="card acc" key={id}>
      <button className="acc-head" onClick={() => toggle(id)} aria-expanded={open === id}>
        <h2>{title}</h2>
        <span className={'chev' + (open === id ? ' up' : '')}>⌄</span>
      </button>
      {open === id && <div className="acc-body">{children}</div>}
    </section>
  )

  return (
    <>
      <header className="top">
        <div>
          <div className="eyebrow">Aurora</div>
          <h1>Más</h1>
        </div>
      </header>

      {section("guia", `Guía: ${methodDef(s.method).short}`, <>
        <Guide method={s.method} />
      </>)}

      {section("metodo", "Cambiar de método", <>
        <MethodPicker value={s.method} onChange={(method) => setSettings({ method })} />
        {s.method === 'calendario' && (
          <div className="filters">
            <label>
              <span>Ciclo más corto (días)</span>
              <input type="number" min={15} max={60} value={s.shortest ?? ''} onChange={(e) => setSettings({ shortest: Number(e.target.value) || undefined })} />
            </label>
            <label>
              <span>Ciclo más largo (días)</span>
              <input type="number" min={15} max={90} value={s.longest ?? ''} onChange={(e) => setSettings({ longest: Number(e.target.value) || undefined })} />
            </label>
          </div>
        )}
      </>)}

      {section("datos", "Tus datos", <>
        <p className="muted small">Todo se guarda únicamente en este dispositivo: nada se envía a ningún servidor. Haz una copia de vez en cuando; si borras los datos del navegador, se pierden.</p>
        <div className="btn-row wrap">
          <button className="btn" disabled={!hasEntries} onClick={() => exportBackup(getData())}>Guardar copia</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Restaurar copia</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
        {!hasEntries && (
          <button className="btn" onClick={() => { replaceAll(demoData(getData())); setMsg('Datos de ejemplo cargados: mira la Gráfica y el Resumen.') }}>
            Cargar datos de ejemplo
          </button>
        )}
        {hasEntries && !confirmDel && <button className="btn ghost danger" onClick={() => setConfirmDel(true)}>Borrar todos los datos</button>}
        {confirmDel && (
          <div className="confirm">
            <p>Se borrarán todos tus registros de este dispositivo. No se puede deshacer.</p>
            <div className="btn-row">
              <button className="btn" onClick={() => setConfirmDel(false)}>Cancelar</button>
              <button className="btn danger-solid" onClick={() => { resetAll(); setConfirmDel(false) }}>Sí, borrar todo</button>
            </div>
          </div>
        )}
        {msg && <p className="ok">{msg}</p>}
      </>)}

      {section("acerca", "Acerca de", <>
        <p>Aurora es un cuaderno digital para registrar tu ciclo con métodos naturales de reconocimiento de la fertilidad.</p>
        <p className="muted small">
          No es un producto sanitario, no diagnostica y no garantiza evitar ni lograr un embarazo. Las estampas y avisos de fertilidad son una ayuda calculada con las reglas básicas de cada método; aprende el método con una instructora acreditada y sigue sus indicaciones.
        </p>
        <p className="muted small">
          CREIGHTON MODEL FertilityCare™ System y NaProTECHNOLOGY® son marcas del Saint Paul VI Institute. Billings Ovulation Method® es marca de WOOMB International. Aurora es independiente y no está afiliada ni avalada por estas organizaciones.
        </p>
      </>)}
    </>
  )
}
