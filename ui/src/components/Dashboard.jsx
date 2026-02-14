import { useEffect, useState } from 'react'
import { fetchEvents } from '../api'

const BAROMETRIC_SCALE_HEIGHT = 8500 // meters

function calcAltitude(pressure, referencePressure) {
  if (!referencePressure || referencePressure <= 0 || pressure <= 0) return null
  return -BAROMETRIC_SCALE_HEIGHT * Math.log(pressure / referencePressure)
}

export default function Dashboard({ referencePressure }) {
  const [events, setEvents] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const poll = () => {
      fetchEvents()
        .then((data) => {
          setEvents(data)
          setError(null)
        })
        .catch((err) => setError(err.message))
    }
    poll()
    const id = setInterval(poll, 2000)
    return () => clearInterval(id)
  }, [])

  const showAltitude = referencePressure > 0

  return (
    <div>
      <h2>Telemetry Events</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Identifier</th>
            <th>Velocity</th>
            <th>Air Pressure</th>
            {showAltitude && <th>Altitude (m)</th>}
            <th>Received</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => {
            const alt = showAltitude
              ? calcAltitude(e.air_pressure, referencePressure)
              : null
            return (
              <tr key={e.id}>
                <td>{e.timestamp}</td>
                <td>{e.identifier}</td>
                <td>{e.velocity}</td>
                <td>{e.air_pressure}</td>
                {showAltitude && <td>{alt !== null ? alt.toFixed(1) : '—'}</td>}
                <td>{new Date(e.save_datetime).toLocaleString()}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {events.length === 0 && !error && <p>No events yet.</p>}
    </div>
  )
}
