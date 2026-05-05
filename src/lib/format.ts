export function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getChatTitle(content: string) {
  const clean = content.replace(/\s+/g, ' ').trim()
  return clean ? clean.slice(0, 46) : 'New local chat'
}
