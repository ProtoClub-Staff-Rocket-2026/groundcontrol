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
      <div
        className="modal settings-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Settings</h3>
        </div>
        <div className="modal-body">
          <label>Air Pressure Reference (hPa)</label>
          <input
            type="number"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
        </div>
        <div className="modal-footer">
          <button onClick={() => setOpen(false)}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}
