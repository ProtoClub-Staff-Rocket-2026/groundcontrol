export async function fetchEvents(identifier) {
  const params = identifier ? `?identifier=${encodeURIComponent(identifier)}` : ''
  const res = await fetch(`/api/events/${params}`)
  if (!res.ok) throw new Error('Failed to fetch events')
  return res.json()
}

export async function fetchSessions() {
  const res = await fetch('/api/events/sessions')
  if (!res.ok) throw new Error('Failed to fetch sessions')
  return res.json()
}

export async function sendLaunch() {
  const res = await fetch('/api/commands/launch')
  return res.json()
}
