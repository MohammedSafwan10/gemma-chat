import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildAttachmentPrompt, filesToAttachments } from '../lib/attachments'
import { MODEL_NAME, starterMessages } from '../lib/constants'
import { deleteSavedChat, loadSavedChats, saveChat, updateSavedChat } from '../lib/db'
import { getChatTitle } from '../lib/format'
import { getOllamaRuntime, streamOllamaChat } from '../lib/ollama'
import type { ChatAttachment, ChatMessage, OllamaStatus, SavedChat } from '../types/chat'

export function useGemmaChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages)
  const [savedChats, setSavedChats] = useState<SavedChat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [attachmentError, setAttachmentError] = useState('')
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
    void loadSavedChats().then(setSavedChats)
  }, [])

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
      void saveChat(savedChat)
    },
    [activeChatId, title],
  )

  const startNewChat = useCallback(() => {
    persistChat(messages)
    setMessages(starterMessages)
    setActiveChatId(null)
    setPrompt('')
    setAttachments([])
    setAttachmentError('')
  }, [messages, persistChat])

  const clearChat = useCallback(() => {
    setMessages(starterMessages)
    setPrompt('')
    setAttachments([])
    setAttachmentError('')
  }, [])

  const loadChat = useCallback(
    (chat: SavedChat) => {
      if (isStreaming) return
      setMessages(chat.messages)
      setActiveChatId(chat.id)
      setPrompt('')
      setAttachments([])
      setAttachmentError('')
    },
    [isStreaming],
  )

  const renameChat = useCallback((id: string, title: string) => {
    const nextTitle = title.trim()
    if (!nextTitle) return
    const updatedAt = new Date().toISOString()
    setSavedChats((current) =>
      current.map((chat) =>
        chat.id === id ? { ...chat, title: nextTitle, updatedAt } : chat,
      ),
    )
    void updateSavedChat(id, { title: nextTitle, updatedAt })
  }, [])

  const deleteChat = useCallback(
    (id: string) => {
      setSavedChats((current) => current.filter((chat) => chat.id !== id))
      void deleteSavedChat(id)
      if (activeChatId === id) {
        setActiveChatId(null)
        setMessages(starterMessages)
      }
    },
    [activeChatId],
  )

  const toggleStarChat = useCallback((id: string) => {
    const chat = savedChats.find((item) => item.id === id)
    const starred = !chat?.starred
    setSavedChats((current) =>
      current.map((item) => (item.id === id ? { ...item, starred } : item)),
    )
    if (chat) void updateSavedChat(id, { starred })
  }, [savedChats])

  const addFiles = useCallback(async (files: FileList | File[]) => {
    setAttachmentError('')
    try {
      const nextAttachments = await filesToAttachments(files)
      if (nextAttachments.length === 0) {
        setAttachmentError('Supported files: images, PDFs, and text/code files.')
        return
      }
      setAttachments((current) => [...current, ...nextAttachments].slice(0, 6))
    } catch {
      setAttachmentError('Could not read that file.')
    }
  }, [])

  const removeAttachment = useCallback((id: string) => {
    setAttachments((current) => current.filter((attachment) => attachment.id !== id))
  }, [])

  const sendMessage = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault()
      const trimmedPrompt = prompt.trim()
      if ((!trimmedPrompt && attachments.length === 0) || isStreaming) return

      const content = buildAttachmentPrompt(
        trimmedPrompt || 'Please analyze the attached file.',
        attachments,
      )

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        attachments,
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
      setAttachments([])
      setAttachmentError('')
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
    [attachments, checkOllama, isStreaming, messages, numCtx, prompt, temperature, think],
  )

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  return {
    activeChatId,
    addFiles,
    attachmentError,
    attachments,
    clearChat,
    isStreaming,
    loadChat,
    messages,
    modelName: MODEL_NAME,
    numCtx,
    prompt,
    deleteChat,
    renameChat,
    runningModel,
    savedChats,
    sendMessage,
    removeAttachment,
    setNumCtx,
    setPrompt,
    setTemperature,
    setThink,
    startNewChat,
    status,
    stopStreaming,
    temperature,
    think,
    toggleStarChat,
  }
}
