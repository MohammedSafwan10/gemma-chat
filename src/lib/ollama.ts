import type { ChatMessage, OllamaStreamChunk } from '../types/chat'
import { MODEL_NAME } from './constants'

type ChatOptions = {
  messages: ChatMessage[]
  think: boolean
  numCtx: number
  temperature: number
  signal: AbortSignal
  onChunk: (contentDelta: string, thinkingDelta: string) => void
}

export async function getOllamaRuntime() {
  const [tagsResponse, psResponse] = await Promise.all([fetch('/ollama/tags'), fetch('/ollama/ps')])

  if (!tagsResponse.ok) {
    throw new Error('Ollama tags failed')
  }

  if (!psResponse.ok) {
    return 'Ready on first message'
  }

  const data = await psResponse.json()
  const active = data.models?.find((item: { name: string }) => item.name === MODEL_NAME)
  return active ? `${active.name} active` : 'Ready on first message'
}

export async function streamOllamaChat({
  messages,
  think,
  numCtx,
  temperature,
  signal,
  onChunk,
}: ChatOptions) {
  const response = await fetch('/ollama/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      model: MODEL_NAME,
      stream: true,
      think,
      messages: messages.map(({ role, content, attachments }) => {
        const images = attachments
          ?.filter((attachment) => attachment.kind === 'image' && attachment.imageBase64)
          .map((attachment) => attachment.imageBase64 as string)

        return images?.length ? { role, content, images } : { role, content }
      }),
      options: {
        num_ctx: numCtx,
        temperature,
      },
    }),
  })

  if (!response.ok || !response.body) {
    throw new Error('Ollama did not return a stream')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.trim()) continue

      const chunk = JSON.parse(line) as OllamaStreamChunk
      if (chunk.error) throw new Error(chunk.error)

      onChunk(chunk.message?.content || '', chunk.message?.thinking || '')
    }
  }
}
