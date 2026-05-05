export type ChatRole = 'user' | 'assistant' | 'system'

export type ChatAttachment = {
  id: string
  name: string
  mimeType: string
  size: number
  kind: 'image' | 'pdf' | 'text'
  text?: string
  imageBase64?: string
  imagePreview?: string
}

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  thinking?: string
  attachments?: ChatAttachment[]
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
