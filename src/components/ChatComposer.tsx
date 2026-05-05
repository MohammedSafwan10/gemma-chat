import type { FormEvent, KeyboardEvent } from 'react'
import { Paperclip, Send, Square, Trash2 } from 'lucide-react'

type ChatComposerProps = {
  prompt: string
  isStreaming: boolean
  onPromptChange: (prompt: string) => void
  onClear: () => void
  onSend: (event?: FormEvent) => void
  onStop: () => void
}

export function ChatComposer({
  prompt,
  isStreaming,
  onPromptChange,
  onClear,
  onSend,
  onStop,
}: ChatComposerProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSend()
    }
  }

  return (
    <form className="composer" onSubmit={onSend}>
      <textarea
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything..."
        rows={3}
      />

      <div className="composer-actions">
        <button type="button" className="icon-button soft" title="Attachments coming next">
          <Paperclip size={17} />
        </button>
        <button type="button" className="icon-button soft" onClick={onClear} title="Clear chat">
          <Trash2 size={17} />
        </button>

        {isStreaming ? (
          <button type="button" className="send-button stop" onClick={onStop}>
            <Square size={15} />
            Stop
          </button>
        ) : (
          <button type="submit" className="send-button" disabled={!prompt.trim()}>
            <Send size={15} />
            Send
          </button>
        )}
      </div>
    </form>
  )
}
