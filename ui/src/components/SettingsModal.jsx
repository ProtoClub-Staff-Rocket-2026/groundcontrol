import { useState } from 'react'

export default function SettingsModal({ referencePressure, onSave }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(referencePressure ?? '')

  const handleSave = () => {
    onSave(parseFloat(value) || 0)
    setOpen(false)
  }

  if (!open) {
    return <button onClick={() => setOpen(true)}>Settings</button>
  }

  return (
    <div className="modal-overlay" onClick={() => setOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Settings</h3>
        <label>
          Air Pressure Reference (hPa):
          <input
            type="number"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <div style={{ marginTop: '1rem' }}>
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setOpen(false)} style={{ marginLeft: '0.5rem' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
