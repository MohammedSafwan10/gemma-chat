import { ChevronDown, Sparkles } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage } from '../types/chat'

type MessageBubbleProps = {
  message: ChatMessage
  isStreaming: boolean
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const [thinkingOpen, setThinkingOpen] = useState(true)
  const hasThinking = Boolean(message.thinking?.trim())
  const hasContent = Boolean(message.content.trim())

  return (
    <div className="bubble">
      {hasThinking ? (
        <section className="thinking-panel">
          <button type="button" onClick={() => setThinkingOpen((current) => !current)}>
            <span>
              <Sparkles size={14} />
              Thinking
            </span>
            <ChevronDown className={thinkingOpen ? 'open' : ''} size={15} />
          </button>
          {thinkingOpen ? <pre>{message.thinking}</pre> : null}
        </section>
      ) : null}

      {hasContent ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
      ) : isStreaming ? (
        <div className="stream-placeholder">
          <span />
          <span />
          <span />
        </div>
      ) : null}
    </div>
  )
}
