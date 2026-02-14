export async function fetchEvents() {
  const res = await fetch('/api/events/')
  if (!res.ok) throw new Error('Failed to fetch events')
  return res.json()
}

export async function sendLaunch() {
  const res = await fetch('/api/commands/launch')
  return res.json()
}
