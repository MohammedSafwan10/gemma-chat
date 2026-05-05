import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CHAT_STORAGE_KEY, MODEL_NAME, starterMessages } from '../lib/constants'
import { getChatTitle } from '../lib/format'
import { getOllamaRuntime, streamOllamaChat } from '../lib/ollama'
import type { ChatMessage, OllamaStatus, SavedChat } from '../types/chat'

export function useGemmaChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages)
  const [savedChats, setSavedChats] = useState<SavedChat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState<OllamaStatus>('checking')
  const [runningModel, setRunningModel] = useState('Checking Ollama')
  const [isStreaming, setIsStreaming] = useState(false)
  const [think, setThink] = useState(false)
  const [temperature, setTemperature] = useState(0.35)
  const [numCtx, setNumCtx] = useState(8192)
  const abortRef = useRef<AbortController | null>(null)

  const title = useMemo(() => {
    const firstUserMessage = messages.find((message) => message.role === 'user')
    return getChatTitle(firstUserMessage?.content || '')
  }, [messages])

  const checkOllama = useCallback(async () => {
    try {
      const runtime = await getOllamaRuntime()
      setStatus('online')
      setRunningModel(runtime)
    } catch {
      setStatus('offline')
      setRunningModel('Ollama not reachable')
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY)
    if (stored) {
      setSavedChats(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(savedChats))
  }, [savedChats])

  useEffect(() => {
    void checkOllama()
    const timer = window.setInterval(checkOllama, 8000)
    return () => window.clearInterval(timer)
  }, [checkOllama])

  const persistChat = useCallback(
    (nextMessages: ChatMessage[]) => {
      if (!nextMessages.some((message) => message.role === 'user')) return

      const savedChat: SavedChat = {
        id: activeChatId || crypto.randomUUID(),
        title,
        updatedAt: new Date().toISOString(),
        messages: nextMessages,
      }

      setActiveChatId(savedChat.id)
      setSavedChats((current) => [
        savedChat,
        ...current.filter((chat) => chat.id !== savedChat.id),
      ].slice(0, 16))
    },
    [activeChatId, title],
  )

  const startNewChat = useCallback(() => {
    persistChat(messages)
    setMessages(starterMessages)
    setActiveChatId(null)
    setPrompt('')
  }, [messages, persistChat])

  const clearChat = useCallback(() => {
    setMessages(starterMessages)
    setPrompt('')
  }, [])

  const loadChat = useCallback(
    (chat: SavedChat) => {
      if (isStreaming) return
      setMessages(chat.messages)
      setActiveChatId(chat.id)
      setPrompt('')
    },
    [isStreaming],
  )

  const sendMessage = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault()
      const trimmedPrompt = prompt.trim()
      if (!trimmedPrompt || isStreaming) return

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmedPrompt,
      }
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        thinking: '',
      }
      const conversationForRequest = [...messages, userMessage]
      const nextMessages = [...conversationForRequest, assistantMessage]

      setMessages(nextMessages)
      setPrompt('')
      setIsStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      let fullContent = ''
      let fullThinking = ''

      try {
        await streamOllamaChat({
          messages: conversationForRequest,
          think,
          numCtx,
          temperature,
          signal: controller.signal,
          onChunk: (contentDelta, thinkingDelta) => {
            fullContent += contentDelta
            fullThinking += thinkingDelta

            setMessages((current) =>
              current.map((message) =>
                message.id === assistantMessage.id
                  ? { ...message, content: fullContent, thinking: fullThinking }
                  : message,
              ),
            )
          },
        })

        void checkOllama()
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantMessage.id
                ? {
                    ...message,
                    content:
                      'I could not reach Ollama. Start it with `ollama serve` or run `ollama run gemma4:e4b --think=false`, then try again.',
                    thinking: '',
                  }
                : message,
            ),
          )
        }
      } finally {
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [checkOllama, isStreaming, messages, numCtx, prompt, temperature, think],
  )

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  return {
    activeChatId,
    clearChat,
    isStreaming,
    loadChat,
    messages,
    modelName: MODEL_NAME,
    numCtx,
    prompt,
    runningModel,
    savedChats,
    sendMessage,
    setNumCtx,
    setPrompt,
    setTemperature,
    setThink,
    startNewChat,
    status,
    stopStreaming,
    temperature,
    think,
  }
}
