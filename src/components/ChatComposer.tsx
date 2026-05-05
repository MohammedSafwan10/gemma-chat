import type { FormEvent, KeyboardEvent } from 'react'
import { useEffect, useRef } from 'react'
import { FileText, Image, Paperclip, Send, Square, Trash2, X } from 'lucide-react'
import type { ChatAttachment } from '../types/chat'

type ChatComposerProps = {
  attachments: ChatAttachment[]
  attachmentError: string
  prompt: string
  isStreaming: boolean
  onAddFiles: (files: FileList | File[]) => void
  onPromptChange: (prompt: string) => void
  onRemoveAttachment: (id: string) => void
  onClear: () => void
  onSend: (event?: FormEvent) => void
  onStop: () => void
}

export function ChatComposer({
  attachments,
  attachmentError,
  prompt,
  isStreaming,
  onAddFiles,
  onPromptChange,
  onRemoveAttachment,
  onClear,
  onSend,
  onStop,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 168)}px`
  }, [prompt])

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSend()
    }
  }

  return (
    <form className="composer" onSubmit={onSend}>
      {attachments.length > 0 ? (
        <div className="attachment-tray">
          {attachments.map((attachment) => (
            <div className="attachment-chip" key={attachment.id}>
              {attachment.kind === 'image' && attachment.imagePreview ? (
                <img src={attachment.imagePreview} alt="" />
              ) : (
                <span className="file-kind">
                  {attachment.kind === 'image' ? <Image size={14} /> : <FileText size={14} />}
                </span>
              )}
              <span>{attachment.name}</span>
              <button type="button" onClick={() => onRemoveAttachment(attachment.id)} aria-label="Remove file">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything..."
        rows={1}
      />

      {attachmentError ? <div className="attachment-error">{attachmentError}</div> : null}

      <div className="composer-actions">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.md,.csv,.json,.ts,.tsx,.js,.jsx,.css,.html,.xml,.yaml,.yml"
          hidden
          onChange={(event) => {
            if (event.target.files) void onAddFiles(event.target.files)
            event.currentTarget.value = ''
          }}
        />
        <button
          type="button"
          className="icon-button soft"
          title="Attach image, PDF, or text file"
          onClick={() => fileInputRef.current?.click()}
        >
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
          <button type="submit" className="send-button" disabled={!prompt.trim() && attachments.length === 0}>
            <Send size={15} />
            Send
          </button>
        )}
      </div>
    </form>
  )
}
