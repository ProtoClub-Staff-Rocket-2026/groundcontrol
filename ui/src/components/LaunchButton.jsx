import { useState } from 'react'
import { sendLaunch } from '../api'

export default function LaunchButton() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLaunch = async () => {
    if (!window.confirm('Are you sure you want to launch?')) return
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
    <div>
      <button onClick={handleLaunch} disabled={loading} className="launch-btn">
        {loading ? 'Launching...' : 'Launch'}
      </button>
      {result && (
        <p>
          Status: {result.status_code} — {result.message || 'OK'}
        </p>
      )}
    </div>
  )
}
