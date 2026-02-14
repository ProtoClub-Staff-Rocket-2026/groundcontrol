import { useState } from 'react'
import { sendLaunch } from '../api'

export default function LaunchButton() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const handleLaunch = async () => {
    setConfirming(false)
    setLoading(true)
    setResult(null)
    try {
      const data = await sendLaunch()
      setResult(data)
    } catch (err) {
      setResult({ status_code: 0, message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        disabled={loading}
        className="launch-btn"
      >
        {loading ? 'Launching...' : 'Launch'}
      </button>

      {result && (
        <div className="launch-result">
          Status {result.status_code} — {result.message || 'OK'}
        </div>
      )}

      {confirming && (
        <div className="modal-overlay" onClick={() => setConfirming(false)}>
          <div
            className="modal launch-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Confirm Launch</h3>
            </div>
            <div className="modal-body">
              <span className="launch-icon">&#9650;</span>
              <p className="launch-warning">
                This will send the launch signal to the pad.
              </p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setConfirming(false)}>Abort</button>
              <button className="launch-confirm-btn" onClick={handleLaunch}>
                Confirm Launch
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
