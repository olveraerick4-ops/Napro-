import { useEffect, useMemo, useState } from 'react'
import { useData } from './lib/store'
import { buildCycles } from './lib/engine'
import { Icon } from './components/art'
import { EntrySheet } from './components/EntrySheet'
import { Onboarding } from './screens/Onboarding'
import { Home } from './screens/Home'
import { ChartScreen } from './screens/ChartScreen'
import { Summary } from './screens/Summary'
import { Clinics } from './screens/Clinics'
import { More } from './screens/More'

type Tab = 'home' | 'chart' | 'stats' | 'clinic' | 'more'
const TABS: { id: Tab; label: string }[] = [
  { id: 'home', label: 'Hoy' },
  { id: 'chart', label: 'Gráfica' },
  { id: 'stats', label: 'Resumen' },
  { id: 'clinic', label: 'Clínicas' },
  { id: 'more', label: 'Más' },
]

export function App() {
  const data = useData()
  const [tab, setTab] = useState<Tab>('home')
  const [editing, setEditing] = useState<string | null>(null)
  const cycles = useMemo(() => buildCycles(data), [data])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [tab])

  if (!data.settings.onboarded) return <Onboarding />

  return (
    <div className="app">
      <main className="screen">
        {tab === 'home' && <Home cycles={cycles} onEdit={setEditing} />}
        {tab === 'chart' && <ChartScreen cycles={cycles} onEdit={setEditing} />}
        {tab === 'stats' && <Summary cycles={cycles} />}
        {tab === 'clinic' && <Clinics />}
        {tab === 'more' && <More />}
      </main>
      <nav className="tabbar" aria-label="Secciones">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
            <Icon name={t.id} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
      {editing && <EntrySheet key={editing} date={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
