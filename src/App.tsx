import { Menu } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ChatComposer } from './components/ChatComposer'
import { ChatSidebar } from './components/ChatSidebar'
import { ChatThread } from './components/ChatThread'
import { RuntimePanel } from './components/RuntimePanel'
import { StatusBadge } from './components/StatusBadge'
import { useGemmaChat } from './hooks/useGemmaChat'
import './index.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const chat = useGemmaChat()

  const title = useMemo(() => {
    const firstUserMessage = chat.messages.find((message) => message.role === 'user')
    return firstUserMessage?.content.slice(0, 54) || 'New local chat'
  }, [chat.messages])

  return (
    <main className={`app-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <ChatSidebar
        modelName={chat.modelName}
        savedChats={chat.savedChats}
        selectedChatId={chat.activeChatId}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((current) => !current)}
        onNewChat={chat.startNewChat}
        onLoadChat={chat.loadChat}
        onRenameChat={chat.renameChat}
        onDeleteChat={chat.deleteChat}
        onToggleStarChat={chat.toggleStarChat}
      />

      <section className="workspace">
        <header className="topbar">
          <button
            className="icon-button topbar-menu"
            type="button"
            onClick={() => setSidebarOpen((current) => !current)}
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>

          <div className="topbar-title">
            <h1>{title}</h1>
            <p>Private local chat through Ollama on this PC.</p>
          </div>

          <StatusBadge status={chat.status} runningModel={chat.runningModel} />
        </header>

        <div className="content-grid">
          <section className="chat-surface">
            <ChatThread messages={chat.messages} isStreaming={chat.isStreaming} />
            <ChatComposer
              attachments={chat.attachments}
              attachmentError={chat.attachmentError}
              prompt={chat.prompt}
              isStreaming={chat.isStreaming}
              onAddFiles={chat.addFiles}
              onPromptChange={chat.setPrompt}
              onRemoveAttachment={chat.removeAttachment}
              onClear={chat.clearChat}
              onSend={chat.sendMessage}
              onStop={chat.stopStreaming}
            />
          </section>

          <RuntimePanel
            modelName={chat.modelName}
            runningModel={chat.runningModel}
            think={chat.think}
            numCtx={chat.numCtx}
            temperature={chat.temperature}
            onThinkChange={chat.setThink}
            onNumCtxChange={chat.setNumCtx}
            onTemperatureChange={chat.setTemperature}
          />
        </div>
      </section>
    </main>
  )
}

export default App
