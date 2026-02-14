import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchEvents } from '../api'

const BAROMETRIC_SCALE_HEIGHT = 8500

function calcAltitude(pressure, referencePressure) {
  if (!referencePressure || referencePressure <= 0 || pressure <= 0) return null
  return -BAROMETRIC_SCALE_HEIGHT * Math.log(pressure / referencePressure)
}

const CHARTS = [
  { key: 'velocity', label: 'Velocity', unit: 'm/s', color: '#3b82f6', glow: 'rgba(59,130,246,0.12)' },
  { key: 'air_pressure', label: 'Air Pressure', unit: 'hPa', color: '#f59e0b', glow: 'rgba(245,158,11,0.12)' },
  { key: 'altitude', label: 'Altitude', unit: 'm', color: '#10b981', glow: 'rgba(16,185,129,0.12)', needsRef: true },
]

function TelemetryChart({ label, dataKey, data, color, glow, unit, latestValue }) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <span className="chart-label">{label}</span>
        <span className="chart-value" style={{ color }}>
          {latestValue !== null && latestValue !== undefined
            ? `${latestValue.toFixed(1)} ${unit}`
            : `— ${unit}`}
        </span>
      </div>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,38,51,0.6)" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#384858', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              axisLine={{ stroke: '#1a2633' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#384858', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                background: '#0b1118',
                border: '1px solid #1a2633',
                borderRadius: 2,
                fontFamily: 'IBM Plex Mono',
                fontSize: 12,
                color: '#c8d6e0',
              }}
              formatter={(value) => [`${value.toFixed(2)} ${unit}`, label]}
              labelFormatter={(l) => `Event ${l}`}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#grad-${dataKey})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function Dashboard({ referencePressure }) {
  const [events, setEvents] = useState([])
  const [error, setError] = useState(null)
  const prevCountRef = useRef(0)

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
      label: e.timestamp,
      velocity: e.velocity,
      air_pressure: e.air_pressure,
      altitude: showAltitude ? calcAltitude(e.air_pressure, referencePressure) : null,
    }))
  }, [events, referencePressure, showAltitude])

  const latestValues = chartData.length > 0 ? chartData[chartData.length - 1] : {}

  const newCount = events.length
  const prevCount = prevCountRef.current
  prevCountRef.current = newCount

  const visibleCharts = CHARTS.filter((c) => !c.needsRef || showAltitude)

  return (
    <div>
      {error && <div className="error-bar">Connection error: {error}</div>}

      {chartData.length > 0 && (
        <div className="charts">
          {visibleCharts.map((c) => (
            <TelemetryChart
              key={c.key}
              label={c.label}
              dataKey={c.key}
              data={chartData}
              color={c.color}
              glow={c.glow}
              unit={c.unit}
              latestValue={latestValues[c.key]}
            />
          ))}
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Event Log</span>
          <span className="panel-title" style={{ opacity: 0.5 }}>{events.length} events</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="events-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Session</th>
                <th>Velocity</th>
                <th>Pressure</th>
                {showAltitude && <th>Altitude</th>}
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => {
                const alt = showAltitude
                  ? calcAltitude(e.air_pressure, referencePressure)
                  : null
                const isNew = i < newCount - prevCount && prevCount > 0
                return (
                  <tr key={e.id} className={isNew ? 'row-new' : ''}>
                    <td className="mono-val">{e.timestamp}</td>
                    <td>{e.identifier}</td>
                    <td className="mono-val">{e.velocity.toFixed(2)}</td>
                    <td className="mono-val">{e.air_pressure.toFixed(2)}</td>
                    {showAltitude && (
                      <td className="mono-val">
                        {alt !== null ? alt.toFixed(1) : '—'}
                      </td>
                    )}
                    <td>{new Date(e.save_datetime).toLocaleTimeString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {events.length === 0 && !error && (
          <div className="empty-state">
            <span>No telemetry data received yet.</span>
          </div>
        )}
      </div>
    </div>
  )
}
