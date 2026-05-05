export type ChatRole = 'user' | 'assistant' | 'system'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  thinking?: string
}

export type SavedChat = {
  id: string
  title: string
  updatedAt: string
  messages: ChatMessage[]
}

export type OllamaStatus = 'checking' | 'online' | 'offline'

export type OllamaStreamChunk = {
  message?: {
    role?: ChatRole
    content?: string
    thinking?: string
  }
  done?: boolean
  error?: string
}
