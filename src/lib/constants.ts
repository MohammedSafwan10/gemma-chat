import type { ChatMessage } from '../types/chat'

export const MODEL_NAME = 'gemma4:e4b'
export const CHAT_STORAGE_KEY = 'gemma-chat-saved-chats'

export const starterMessages: ChatMessage[] = [
  {
    id: crypto.randomUUID(),
    role: 'assistant',
    content:
      "I'm connected to your local Gemma 4 E4B through Ollama. Ask me anything and I will stream the answer here with clean markdown.",
  },
]
