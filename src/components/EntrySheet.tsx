import { useMemo, useState } from 'react'
import type { Bleeding, CrBase, CrMod, DayEntry, Freq } from '../types'
import { addDays, diffDays, fmtLong, today } from '../lib/dates'
import { APPEARANCES, BLEEDING, CR_BASES, CR_COLORS, CR_CONSIST, CR_FREQ, SENSATIONS, crCode, crNeedsMods, methodDef } from '../lib/methods'
import { classify } from '../lib/engine'
import { deleteEntry, saveEntry, useData } from '../lib/store'
import { BaseArt, Icon, Stamp, Swatch } from './art'

export function EntrySheet({ date, onClose }: { date: string; onClose: () => void }) {
  const data = useData()
  const method = data.settings.method
  const def = methodDef(method)
  const existing = data.entries[date]

  // ¿parece el primer día de una regla nueva?
  const suggestStart = useMemo(() => {
    if (data.entries[addDays(date, -1)]?.bleeding) return false
    const starts = Object.values(data.entries).filter((e) => e.periodStart && e.date !== date)
    return !starts.some((e) => Math.abs(diffDays(e.date, date)) < 15)
  }, [data.entries, date])

  const [e, setE] = useState<DayEntry>(existing ?? { date })
  const [startTouched, setStartTouched] = useState(existing?.periodStart !== undefined)
  const [tempText, setTempText] = useState(existing?.temp != null ? String(existing.temp) : '')
  const patch = (p: Partial<DayEntry>) => setE((x) => ({ ...x, ...p }))

  const isStart = startTouched ? !!e.periodStart : !!e.bleeding && e.bleeding !== 'B' && e.bleeding !== 'VL' && suggestStart

  const setBleeding = (b: Bleeding | undefined) => patch({ bleeding: b })
  const setBase = (base: CrBase) =>
    patch({ cr: { base, mods: crNeedsMods(base) ? (e.cr?.mods ?? []) : [], freq: e.cr?.freq } })
  const toggleMod = (m: CrMod) => {
    if (!e.cr) return
    const colors: CrMod[] = ['K', 'C/K', 'C']
    let mods = e.cr.mods.includes(m) ? e.cr.mods.filter((x) => x !== m) : [...e.cr.mods, m]
    // transparente / nublado / mixto son excluyentes entre sí
    if (colors.includes(m) && mods.includes(m)) mods = mods.filter((x) => x === m || !colors.includes(x))
    patch({ cr: { ...e.cr, mods } })
  }

  const temp = tempText.trim() === '' ? undefined : Number(tempText.replace(',', '.'))
  const tempBad = temp !== undefined && (!Number.isFinite(temp) || temp < 34 || temp > 42)
  const modsMissing = !!e.cr && crNeedsMods(e.cr.base) && e.cr.mods.length === 0
  const draft: DayEntry = { ...e, temp: tempBad ? undefined : temp, periodStart: e.bleeding ? (startTouched ? !!e.periodStart : isStart || undefined) : undefined }
  if (!draft.bleeding) delete draft.bleeding
  if (draft.temp === undefined) {
    delete draft.temp
    delete draft.tempDisturbed
  }
  if (!draft.notes?.trim()) delete draft.notes
  if (!draft.intercourse) delete draft.intercourse
  const hasContent = !!(draft.bleeding || draft.cr || draft.mucus || draft.temp != null || draft.notes || draft.intercourse)
  const canSave = hasContent && !tempBad && !modsMissing

  const cls = classify(draft, method)
  const previewStamp = draft.bleeding ? 'red' : cls === 'peak' || cls === 'nonpeak' ? 'white-baby' : cls === 'dry' ? 'green' : 'empty'

  const save = () => {
    saveEntry(draft)
    onClose()
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Registro del día" onClick={(ev) => ev.stopPropagation()}>
        <header className="sheet-head">
          <div>
            <div className="eyebrow">{date === today() ? 'Hoy' : 'Registro'}</div>
            <h2>{fmtLong(date)}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>

        <div className="sheet-body">
          <section>
            <h3>Sangrado</h3>
            <div className="chips">
              <button className={'chip' + (!e.bleeding ? ' on' : '')} onClick={() => setBleeding(undefined)}>
                Ninguno
              </button>
              {BLEEDING.map((b) => (
                <button key={b.id} className={'chip bleed-' + b.id + (e.bleeding === b.id ? ' on' : '')} onClick={() => setBleeding(b.id)}>
                  <span className="chip-dot" />
                  {b.label}
                </button>
              ))}
            </div>
            {e.bleeding && (
              <label className="check">
                <input
                  type="checkbox"
                  checked={isStart}
                  onChange={(ev) => {
                    setStartTouched(true)
                    patch({ periodStart: ev.target.checked })
                  }}
                />
                <span>
                  Empieza un ciclo nuevo <small>(día 1 de la regla)</small>
                </span>
              </label>
            )}
          </section>

          {def.usesMucus === 'creighton' && (
            <>
              <section>
                <h3>Observación más fértil del día</h3>
                <p className="hint">Sensación al limpiar, lo que ves en el papel y la prueba con los dedos.</p>
                {(['seco', 'moco', 'lub'] as const).map((g) => (
                  <div key={g}>
                    <div className="group-label">
                      {g === 'seco' ? 'Sin moco, sin lubricación' : g === 'moco' ? 'Moco que se puede estirar' : 'Sin moco, pero con lubricación (tipo Pico)'}
                    </div>
                    <div className={'obs-grid' + (g !== 'seco' ? ' three' : '')}>
                      {CR_BASES.filter((b) => b.group === g).map((b) => (
                        <button key={b.id} className={'obs' + (e.cr?.base === b.id ? ' on' : '')} onClick={() => setBase(b.id)} aria-pressed={e.cr?.base === b.id}>
                          <BaseArt base={b.id} />
                          <span className="obs-code">{b.id}</span>
                          <span className="obs-label">{b.label}</span>
                          <span className="obs-hint">{b.hint}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </section>

              {e.cr && crNeedsMods(e.cr.base) && (
                <section>
                  <h3>Color y consistencia</h3>
                  <p className="hint">Levanta el moco a la altura de los ojos: ¿puedes ver a través de él?</p>
                  <div className="swatch-list">
                    {CR_COLORS.map((c) => (
                      <button key={c.id} className={'swatch-row' + (e.cr!.mods.includes(c.id) ? ' on' : '')} onClick={() => toggleMod(c.id)} aria-pressed={e.cr!.mods.includes(c.id)}>
                        <Swatch mod={c.id} />
                        <span className="swatch-text">
                          <b>{c.label}</b>
                          <small>{c.desc}</small>
                        </span>
                        <span className="code-pill">{c.id}</span>
                      </button>
                    ))}
                    {CR_CONSIST.map((c) => (
                      <button key={c.id} className={'swatch-row' + (e.cr!.mods.includes(c.id) ? ' on' : '')} onClick={() => toggleMod(c.id)} aria-pressed={e.cr!.mods.includes(c.id)}>
                        <Swatch mod={c.id} />
                        <span className="swatch-text">
                          <b>{c.label}</b>
                          <small>{c.desc}</small>
                        </span>
                        <span className="code-pill">{c.id}</span>
                      </button>
                    ))}
                  </div>
                  <label className="check">
                    <input type="checkbox" checked={e.cr.mods.includes('L')} onChange={() => toggleMod('L')} />
                    <span>
                      Sensación lubricante <small>(el papel se desliza) · L</small>
                    </span>
                  </label>
                  {modsMissing && <p className="warn">Con 6, 8 o 10 hay que anotar al menos un color, consistencia o la lubricación.</p>}
                </section>
              )}

              {e.cr && (
                <section>
                  <h3>¿Cuántas veces lo observaste?</h3>
                  <div className="chips">
                    {CR_FREQ.map((f) => (
                      <button key={f.id} className={'chip' + (e.cr!.freq === f.id ? ' on' : '')} onClick={() => patch({ cr: { ...e.cr!, freq: e.cr!.freq === f.id ? undefined : (f.id as Freq) } })}>
                        {f.label} <small>{f.id}</small>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {def.usesMucus === 'simple' && (
            <>
              <section>
                <h3>Sensación en la vulva</h3>
                <div className="obs-grid">
                  {SENSATIONS.map((s) => (
                    <button
                      key={s.id}
                      className={'obs' + (e.mucus?.sensation === s.id ? ' on' : '')}
                      onClick={() => patch({ mucus: { sensation: s.id, appearance: e.mucus?.appearance ?? 'nada' } })}
                    >
                      <BaseArt base={s.id === 'seca' ? '0' : s.id === 'humeda' ? '2' : s.id === 'mojada' ? '2W' : '10WL'} />
                      <span className="obs-label">{s.label}</span>
                      <span className="obs-hint">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <h3>Apariencia del moco</h3>
                <div className="swatch-list">
                  {APPEARANCES.map((a) => (
                    <button
                      key={a.id}
                      className={'swatch-row' + (e.mucus?.appearance === a.id ? ' on' : '')}
                      onClick={() => patch({ mucus: { sensation: e.mucus?.sensation ?? 'seca', appearance: a.id } })}
                    >
                      {a.id === 'nada' ? <span className="swatch swatch-none" /> : <Swatch mod={a.id === 'espeso' ? 'C' : 'K'} />}
                      <span className="swatch-text">
                        <b>{a.label}</b>
                        <small>{a.desc}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {def.usesTemp && (
            <section>
              <h3>Temperatura basal</h3>
              <p className="hint">Al despertar, antes de levantarte y siempre a la misma hora.</p>
              <div className="temp-row">
                <input
                  className="temp-input"
                  inputMode="decimal"
                  placeholder="36,50"
                  value={tempText}
                  onChange={(ev) => setTempText(ev.target.value)}
                  aria-label="Temperatura en grados Celsius"
                />
                <span className="unit">°C</span>
              </div>
              {tempBad && <p className="warn">Escribe una temperatura entre 34 y 42 °C.</p>}
              <label className="check">
                <input type="checkbox" checked={!!e.tempDisturbed} onChange={(ev) => patch({ tempDisturbed: ev.target.checked })} />
                <span>
                  Medición alterada <small>(fiebre, mala noche, alcohol, otra hora): no contará</small>
                </span>
              </label>
            </section>
          )}

          <section>
            <h3>Otros</h3>
            <label className="check">
              <input type="checkbox" checked={!!e.intercourse} onChange={(ev) => patch({ intercourse: ev.target.checked })} />
              <span>
                Relación íntima <small>· I</small>
              </span>
            </label>
            <textarea className="notes" rows={2} placeholder="Notas (dolor, ánimo, medicación…)" value={e.notes ?? ''} onChange={(ev) => patch({ notes: ev.target.value })} />
          </section>
        </div>

        <footer className="sheet-foot">
          {method === 'creighton' && (
            <div className="code-preview">
              <Stamp kind={previewStamp} size={26} />
              <span>{crCode(draft) || '—'}</span>
            </div>
          )}
          {existing && (
            <button
              className="btn ghost danger"
              onClick={() => {
                deleteEntry(date)
                onClose()
              }}
            >
              Borrar
            </button>
          )}
          <button className="btn primary" disabled={!canSave} onClick={save}>
            Guardar
          </button>
        </footer>
      </div>
    </div>
  )
}
