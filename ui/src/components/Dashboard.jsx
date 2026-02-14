import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchEvents } from '../api'

const BAROMETRIC_SCALE_HEIGHT = 8500 // meters

function calcAltitude(pressure, referencePressure) {
  if (!referencePressure || referencePressure <= 0 || pressure <= 0) return null
  return -BAROMETRIC_SCALE_HEIGHT * Math.log(pressure / referencePressure)
}

const CHART_COLORS = {
  velocity: '#3b82f6',
  air_pressure: '#f59e0b',
  altitude: '#10b981',
}

function TelemetryChart({ title, dataKey, data, color, unit }) {
  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis dataKey="index" tick={{ fill: '#888', fontSize: 12 }} />
          <YAxis tick={{ fill: '#888', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ background: '#1a1a1a', border: '1px solid #333', color: '#e0e0e0' }}
            formatter={(value) => [`${value.toFixed(2)} ${unit}`, title]}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
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

  const chartData = useMemo(() => {
    return [...events].reverse().map((e, i) => ({
      index: i + 1,
      velocity: e.velocity,
      air_pressure: e.air_pressure,
      altitude: showAltitude ? calcAltitude(e.air_pressure, referencePressure) : null,
    }))
  }, [events, referencePressure, showAltitude])

  return (
    <div>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {chartData.length > 0 && (
        <div className="charts">
          <TelemetryChart
            title="Velocity"
            dataKey="velocity"
            data={chartData}
            color={CHART_COLORS.velocity}
            unit="m/s"
          />
          <TelemetryChart
            title="Air Pressure"
            dataKey="air_pressure"
            data={chartData}
            color={CHART_COLORS.air_pressure}
            unit="hPa"
          />
          {showAltitude && (
            <TelemetryChart
              title="Altitude"
              dataKey="altitude"
              data={chartData}
              color={CHART_COLORS.altitude}
              unit="m"
            />
          )}
        </div>
      )}

      <h2>Telemetry Events</h2>
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
