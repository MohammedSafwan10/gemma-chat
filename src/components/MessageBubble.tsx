import { ChevronDown, FileText, Image, Sparkles } from 'lucide-react'
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
      {message.attachments?.length ? (
        <div className="message-attachments">
          {message.attachments.map((attachment) =>
            attachment.kind === 'image' && attachment.imagePreview ? (
              <img key={attachment.id} src={attachment.imagePreview} alt={attachment.name} />
            ) : (
              <span key={attachment.id}>
                {attachment.kind === 'image' ? <Image size={14} /> : <FileText size={14} />}
                {attachment.name}
              </span>
            ),
          )}
        </div>
      ) : null}

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
