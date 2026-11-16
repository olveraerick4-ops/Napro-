import type { AppData } from '../types'
import type { Cycle, StampKind } from './engine'
import { stats } from './engine'
import { fmtDM, fmtShort, today } from './dates'
import { BLEEDING, codeFor, describeEntry, methodDef } from './methods'

const STAMP_NAME: Record<StampKind, string> = {
  empty: '',
  red: 'Roja',
  green: 'Verde',
  'white-baby': 'Blanca con bebé',
  'green-baby': 'Verde con bebé',
  plain: '',
}
const STAMP_RGB: Record<StampKind, [number, number, number] | null> = {
  empty: null,
  red: [214, 72, 63],
  green: [79, 158, 99],
  'white-baby': [255, 255, 255],
  'green-baby': [79, 158, 99],
  plain: [236, 230, 234],
}
const hex = (c: [number, number, number]) => 'FF' + c.map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase()
const FERT = { fertil: 'Fértil', infertil: 'Infértil', desconocido: '' }

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

const cycleName = (c: Cycle) => (c.hasStart ? `Ciclo ${c.index}` : 'Previo')

export async function exportExcel(data: AppData, cycles: Cycle[]) {
  const ExcelJS = (await import('exceljs')).default
  const method = data.settings.method
  const def = methodDef(method)
  const wb = new ExcelJS.Workbook()
  wb.created = new Date()

  // --- Hoja 1: registro diario ---
  const ws = wb.addWorksheet('Registro')
  ws.columns = [
    { header: 'Fecha', key: 'date', width: 12 },
    { header: 'Ciclo', key: 'cycle', width: 9 },
    { header: 'Día', key: 'cd', width: 6 },
    { header: 'Sangrado', key: 'bleed', width: 14 },
    { header: 'Código', key: 'code', width: 14 },
    { header: 'Descripción', key: 'desc', width: 44 },
    { header: 'Estampa', key: 'stamp', width: 16 },
    { header: 'Marca', key: 'mark', width: 7 },
    { header: 'Temp. °C', key: 'temp', width: 10 },
    { header: 'Fertilidad', key: 'fert', width: 11 },
    { header: 'Relación', key: 'i', width: 9 },
    { header: 'Notas', key: 'notes', width: 36 },
  ]
  ws.getRow(1).font = { bold: true }
  ws.views = [{ state: 'frozen', ySplit: 1 }]
  for (const c of cycles)
    for (const d of c.days) {
      if (!d.entry) continue
      const e = d.entry
      const row = ws.addRow({
        date: new Date(d.date + 'T12:00:00Z'),
        cycle: cycleName(c),
        cd: c.hasStart ? d.cd : '',
        bleed: e.bleeding ? BLEEDING.find((b) => b.id === e.bleeding)!.label : '',
        code: codeFor(e, method),
        desc: describeEntry(e, method),
        stamp: STAMP_NAME[d.stamp],
        mark: d.mark,
        temp: e.temp ?? '',
        fert: FERT[d.fertility],
        i: e.intercourse ? 'I' : '',
        notes: e.notes ?? '',
      })
      row.getCell('date').numFmt = 'dd/mm/yyyy'
      const rgb = STAMP_RGB[d.stamp]
      if (rgb && d.stamp !== 'plain') {
        const cell = row.getCell('stamp')
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hex(rgb) } }
        if (d.stamp !== 'white-baby') cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
      }
    }

  // --- Hoja 2: gráfica (una fila de estampas por ciclo) ---
  const g = wb.addWorksheet('Gráfica')
  const maxLen = Math.max(35, ...cycles.map((c) => c.days.length))
  g.getColumn(1).width = 12
  for (let i = 2; i <= maxLen + 1; i++) g.getColumn(i).width = 7
  const head = g.addRow(['Día', ...Array.from({ length: maxLen }, (_, i) => i + 1)])
  head.font = { bold: true }
  head.alignment = { horizontal: 'center' }
  for (const c of cycles) {
    const r1 = g.addRow([cycleName(c), ...c.days.map((d) => fmtDM(d.date))])
    const r2 = g.addRow(['Estampa', ...c.days.map((d) => d.mark + (d.stamp.endsWith('baby') ? ' ☺' : ''))])
    const r3 = g.addRow(['Registro', ...c.days.map((d) => (d.entry ? codeFor(d.entry, method) + (d.entry.intercourse ? ' I' : '') : ''))])
    r1.font = { size: 8, color: { argb: 'FF777777' } }
    r1.getCell(1).font = { bold: true }
    r2.height = 24
    r3.height = 30
    c.days.forEach((d, i) => {
      const cell = r2.getCell(i + 2)
      const rgb = STAMP_RGB[d.stamp]
      if (rgb) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hex(rgb) } }
      cell.font = { bold: true, color: { argb: d.stamp === 'red' || d.stamp.startsWith('green') ? 'FFFFFFFF' : 'FF333333' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      const cc = r3.getCell(i + 2)
      cc.alignment = { horizontal: 'center', vertical: 'top', wrapText: true }
      cc.font = { size: 8 }
    })
    g.addRow([])
  }
  g.views = [{ state: 'frozen', xSplit: 1, ySplit: 1 }]

  // --- Hoja 3: resumen de ciclos ---
  const r = wb.addWorksheet('Ciclos')
  r.columns = [
    { header: 'Ciclo', key: 'n', width: 9 },
    { header: 'Inicio', key: 'start', width: 12 },
    { header: 'Duración (días)', key: 'len', width: 16 },
    { header: 'Día Pico', key: 'peak', width: 10 },
    { header: 'Subida de temperatura (día)', key: 'shift', width: 26 },
    { header: 'Fase post-Pico (días)', key: 'post', width: 20 },
  ]
  r.getRow(1).font = { bold: true }
  for (const c of cycles.filter((x) => x.hasStart)) {
    const row = r.addRow({
      n: c.index,
      start: new Date(c.start + 'T12:00:00Z'),
      len: c.complete ? c.length : 'en curso',
      peak: c.peakIdx !== null ? c.peakIdx + 1 : '',
      shift: c.shift ? c.shift.firstHigh + 1 : '',
      post: c.postPeak ?? '',
    })
    row.getCell('start').numFmt = 'dd/mm/yyyy'
  }
  const s = stats(cycles)
  r.addRow([])
  r.addRow(['Método', def.name])
  r.addRow(['Ciclos completos', s.completed])
  r.addRow(['Duración media', s.avg ?? ''])
  r.addRow(['Más corto', s.shortest ?? ''])
  r.addRow(['Más largo', s.longest ?? ''])
  r.addRow(['Día Pico medio', s.avgPeak ?? ''])
  r.addRow(['Fase post-Pico media', s.avgPostPeak ?? ''])

  const buf = await wb.xlsx.writeBuffer()
  download(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `aurora-${today()}.xlsx`)
}

export async function exportPdf(data: AppData, cycles: Cycle[]) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const method = data.settings.method
  const def = methodDef(method)
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const PW = 297
  const M = 12
  const s = stats(cycles)

  const title = () => {
    doc.setFont('helvetica', 'bold').setFontSize(15).setTextColor(60, 40, 60)
    doc.text('Gráfica del ciclo', M, 15)
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(110)
    doc.text(`${def.name} · generado el ${fmtShort(today())} ${today().slice(0, 4)} con Aurora`, M, 21)
  }
  title()

  const cw = 7.6 // 35 columnas en una fila
  const COLS = 35
  let y = 28
  const rowH = 27
  for (const c of cycles) {
    // un ciclo largo ocupa varias filas de 35 días
    for (let off = 0; off < c.days.length; off += COLS) {
      if (y + rowH + 6 > 200) {
        doc.addPage()
        title()
        y = 28
      }
      doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(60)
      doc.text(
        off === 0
          ? `${cycleName(c)} · inicio ${fmtShort(c.start)} · ${c.complete ? c.length + ' días' : 'en curso'}${c.peakIdx !== null && def.usesMucus ? ' · Pico día ' + (c.peakIdx + 1) : ''}`
          : `${cycleName(c)} (continuación)`,
        M,
        y,
      )
      y += 2
      c.days.slice(off, off + COLS).forEach((d, i) => {
        const x = M + i * cw
        doc.setDrawColor(190).setLineWidth(0.15)
        doc.setFont('helvetica', 'normal').setFontSize(6).setTextColor(120)
        doc.text(String(d.cd), x + cw / 2, y + 3, { align: 'center' })
        // estampa
        const rgb = STAMP_RGB[d.stamp]
        if (rgb) {
          doc.setFillColor(...rgb)
          doc.rect(x + 0.5, y + 4, cw - 1, 9, 'FD')
        } else doc.rect(x + 0.5, y + 4, cw - 1, 9, 'S')
        const light = d.stamp === 'white-baby' || d.stamp === 'plain' || d.stamp === 'empty'
        if (d.stamp.endsWith('baby')) {
          doc.setDrawColor(light ? 90 : 255).setLineWidth(0.25)
          doc.circle(x + cw / 2, y + 10.4, 1.6, 'S')
        }
        if (d.mark) {
          doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(light ? 40 : 255)
          doc.text(d.mark, x + cw / 2, y + (d.stamp.endsWith('baby') ? 7.6 : 9.6), { align: 'center' })
        }
        // código (hasta 3 líneas)
        if (d.entry) {
          doc.setFont('helvetica', 'normal').setFontSize(5.2).setTextColor(40)
          const parts = codeFor(d.entry, method).split(' ')
          if (d.entry.intercourse) parts.push('I')
          parts.slice(0, 4).forEach((p, k) => doc.text(p, x + cw / 2, y + 15.6 + k * 2.2, { align: 'center' }))
        }
        doc.setFont('helvetica', 'normal').setFontSize(4.6).setTextColor(140)
        doc.text(fmtDM(d.date), x + cw / 2, y + 24.6, { align: 'center' })
        doc.setDrawColor(215).setLineWidth(0.1)
        doc.rect(x, y, cw, 25.5, 'S')
      })
      y += rowH + 3
    }
  }

  // --- resumen ---
  doc.addPage()
  doc.setFont('helvetica', 'bold').setFontSize(15).setTextColor(60, 40, 60)
  doc.text('Resumen', M, 15)
  autoTable(doc, {
    startY: 20,
    margin: { left: M, right: PW / 2 + 4 },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 1.4 },
    body: [
      ['Método', def.name],
      ['Ciclos completos', String(s.completed)],
      ['Duración media', s.avg ? `${s.avg} días` : '—'],
      ['Más corto / más largo', s.shortest ? `${s.shortest} / ${s.longest} días` : '—'],
      ['Día Pico medio', s.avgPeak ? `día ${s.avgPeak}` : '—'],
      ['Fase post-Pico media', s.avgPostPeak ? `${s.avgPostPeak} días` : '—'],
      ['Días de regla (media)', s.avgBleed ? `${s.avgBleed}` : '—'],
    ],
    columnStyles: { 0: { textColor: 110 }, 1: { fontStyle: 'bold' } },
  })
  autoTable(doc, {
    startY: 20,
    margin: { left: PW / 2 + 4, right: M },
    styles: { fontSize: 8.5 },
    headStyles: { fillColor: [123, 74, 114] },
    head: [['Ciclo', 'Inicio', 'Duración', 'Día Pico', 'Subida temp.', 'Post-Pico']],
    body: cycles
      .filter((c) => c.hasStart)
      .map((c) => [
        String(c.index),
        fmtShort(c.start),
        c.complete ? `${c.length} d` : 'en curso',
        c.peakIdx !== null ? String(c.peakIdx + 1) : '—',
        c.shift ? `día ${c.shift.firstHigh + 1}` : '—',
        c.postPeak !== null ? `${c.postPeak} d` : '—',
      ]),
  })
  doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(130)
  doc.text('Registro personal generado por la usuaria. No es un informe médico. Estampas calculadas a partir de las observaciones registradas.', M, 200)
  doc.save(`aurora-${today()}.pdf`)
}

export function exportBackup(data: AppData) {
  download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `aurora-copia-${today()}.json`)
}
