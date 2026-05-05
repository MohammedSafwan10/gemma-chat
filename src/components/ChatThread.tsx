import { Bot } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../types/chat'
import { MessageBubble } from './MessageBubble'

type ChatThreadProps = {
  messages: ChatMessage[]
  isStreaming: boolean
}

export function ChatThread({ messages, isStreaming }: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="thread">
      {messages.map((message) => (
        <article key={message.id} className={`message ${message.role}`}>
          <div className="avatar">{message.role === 'user' ? 'S' : <Bot size={16} />}</div>
          <MessageBubble message={message} isStreaming={isStreaming && message === messages.at(-1)} />
        </article>
      ))}
      <div ref={scrollRef} />
    </div>
  )
}
