import { MessageSquarePlus, MoreHorizontal, Pencil, Search, Star, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatTime } from '../lib/format'
import type { SavedChat } from '../types/chat'

type ChatSidebarProps = {
  modelName: string
  savedChats: SavedChat[]
  selectedChatId: string | null
  open: boolean
  onToggle: () => void
  onNewChat: () => void
  onLoadChat: (chat: SavedChat) => void
  onRenameChat: (id: string, title: string) => void
  onDeleteChat: (id: string) => void
  onToggleStarChat: (id: string) => void
}

export function ChatSidebar({
  modelName,
  savedChats,
  selectedChatId,
  open,
  onToggle,
  onNewChat,
  onLoadChat,
  onRenameChat,
  onDeleteChat,
  onToggleStarChat,
}: ChatSidebarProps) {
  const [menuChatId, setMenuChatId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const filteredChats = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const matches = normalizedQuery
      ? savedChats.filter((chat) => chat.title.toLowerCase().includes(normalizedQuery))
      : savedChats

    return {
      starred: matches.filter((chat) => chat.starred),
      recent: matches.filter((chat) => !chat.starred),
    }
  }, [query, savedChats])

  function rename(chat: SavedChat) {
    const nextTitle = window.prompt('Rename chat', chat.title)
    if (nextTitle) onRenameChat(chat.id, nextTitle)
    setMenuChatId(null)
  }

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <strong>Gemma</strong>
        <button className="sidebar-collapse" type="button" onClick={onToggle} aria-label="Close sidebar">
          <span />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Main">
        <button type="button" onClick={onNewChat}>
          <MessageSquarePlus size={18} />
          New chat
        </button>
        <label>
          <Search size={18} />
          <input
            aria-label="Search chats"
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </nav>

      <div className="sidebar-model">{modelName}</div>

      <div className="sidebar-scroll">
        {filteredChats.starred.length > 0 ? (
          <ChatGroup
            title="Starred"
            chats={filteredChats.starred}
            selectedChatId={selectedChatId}
            menuChatId={menuChatId}
            onMenuChange={setMenuChatId}
            onLoadChat={onLoadChat}
            onRenameChat={rename}
            onDeleteChat={onDeleteChat}
            onToggleStarChat={onToggleStarChat}
          />
        ) : null}

        <ChatGroup
          title="Recents"
          chats={filteredChats.recent}
          selectedChatId={selectedChatId}
          menuChatId={menuChatId}
          onMenuChange={setMenuChatId}
          onLoadChat={onLoadChat}
          onRenameChat={rename}
          onDeleteChat={onDeleteChat}
          onToggleStarChat={onToggleStarChat}
          emptyText={query ? 'No chats found.' : 'Your saved chats will appear here.'}
        />
      </div>
    </aside>
  )
}

type ChatGroupProps = {
  title: string
  chats: SavedChat[]
  selectedChatId: string | null
  menuChatId: string | null
  emptyText?: string
  onMenuChange: (id: string | null) => void
  onLoadChat: (chat: SavedChat) => void
  onRenameChat: (chat: SavedChat) => void
  onDeleteChat: (id: string) => void
  onToggleStarChat: (id: string) => void
}

function ChatGroup({
  title,
  chats,
  selectedChatId,
  menuChatId,
  emptyText,
  onMenuChange,
  onLoadChat,
  onRenameChat,
  onDeleteChat,
  onToggleStarChat,
}: ChatGroupProps) {
  return (
    <section className="chat-group">
      <div className="section-title">{title}</div>
      {chats.length === 0 ? (
        <p className="empty-state">{emptyText}</p>
      ) : (
        <div className="chat-list">
          {chats.map((chat) => (
            <div className={`chat-row ${chat.id === selectedChatId ? 'selected' : ''}`} key={chat.id}>
              <button className="chat-row-main" type="button" onClick={() => onLoadChat(chat)}>
                <span>{chat.title}</span>
                <small>{formatTime(chat.updatedAt)}</small>
              </button>
              <button
                className="chat-menu-button"
                type="button"
                onClick={() => onMenuChange(menuChatId === chat.id ? null : chat.id)}
                aria-label="Chat actions"
              >
                <MoreHorizontal size={17} />
              </button>

              {menuChatId === chat.id ? (
                <div className="chat-menu">
                  <button type="button" onClick={() => onToggleStarChat(chat.id)}>
                    <Star size={15} />
                    {chat.starred ? 'Unstar' : 'Star'}
                  </button>
                  <button type="button" onClick={() => onRenameChat(chat)}>
                    <Pencil size={15} />
                    Rename
                  </button>
                  <button
                    className="danger"
                    type="button"
                    onClick={() => {
                      onDeleteChat(chat.id)
                      onMenuChange(null)
                    }}
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
