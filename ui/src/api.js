export async function fetchSessions() {
  const res = await fetch('/api/events/sessions')
  if (!res.ok) throw new Error('Failed to fetch sessions')
  return res.json()
}

export async function sendLaunch() {
  const res = await fetch('/api/commands/launch')
  return res.json()
}

export function getEventsWsUrl(identifier) {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${location.host}/api/ws/events?identifier=${encodeURIComponent(identifier)}`
}
