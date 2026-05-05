import { MessageSquarePlus, Search, Sparkles } from 'lucide-react'
import { formatTime } from '../lib/format'
import type { SavedChat } from '../types/chat'

type ChatSidebarProps = {
  modelName: string
  savedChats: SavedChat[]
  selectedChatId: string | null
  open: boolean
  onNewChat: () => void
  onLoadChat: (chat: SavedChat) => void
}

export function ChatSidebar({
  modelName,
  savedChats,
  selectedChatId,
  open,
  onNewChat,
  onLoadChat,
}: ChatSidebarProps) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">
        <span className="brand-mark">
          <Sparkles size={18} />
        </span>
        <div>
          <strong>Gemma Chat</strong>
          <small>{modelName}</small>
        </div>
      </div>

      <button className="new-chat-button" type="button" onClick={onNewChat}>
        <MessageSquarePlus size={17} />
        New chat
      </button>

      <label className="search-box">
        <Search size={16} />
        <input aria-label="Search chats" placeholder="Search chats" />
      </label>

      <section className="sidebar-section">
        <div className="section-title">Recent</div>
        <div className="chat-list">
          {savedChats.length === 0 ? (
            <p className="empty-state">Your saved chats will appear here.</p>
          ) : (
            savedChats.map((chat) => (
              <button
                className={chat.id === selectedChatId ? 'selected' : ''}
                key={chat.id}
                type="button"
                onClick={() => onLoadChat(chat)}
              >
                <span>{chat.title}</span>
                <small>{formatTime(chat.updatedAt)}</small>
              </button>
            ))
          )}
        </div>
      </section>
    </aside>
  )
}
