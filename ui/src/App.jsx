import { useState } from 'react'
import Dashboard from './components/Dashboard'
import LaunchButton from './components/LaunchButton'
import SettingsModal from './components/SettingsModal'

const STORAGE_KEY = 'gc_reference_pressure'

function loadRef() {
  const v = localStorage.getItem(STORAGE_KEY)
  return v ? parseFloat(v) : 0
}

export default function App() {
  const [referencePressure, setReferencePressure] = useState(loadRef)

  const handleSave = (val) => {
    setReferencePressure(val)
    localStorage.setItem(STORAGE_KEY, String(val))
  }

  return (
    <div className="app">
      <header>
        <h1>Ground Control</h1>
        <div className="header-actions">
          <SettingsModal referencePressure={referencePressure} onSave={handleSave} />
          <LaunchButton />
        </div>
      </header>
      <main>
        <Dashboard referencePressure={referencePressure} />
      </main>
    </div>
  )
}
