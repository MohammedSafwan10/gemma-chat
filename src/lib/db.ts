import Dexie, { type Table } from 'dexie'
import type { SavedChat } from '../types/chat'
import { CHAT_STORAGE_KEY } from './constants'

const migrationKey = 'gemma-chat-indexeddb-migrated'

class GemmaChatDatabase extends Dexie {
  chats!: Table<SavedChat, string>

  constructor() {
    super('gemma-chat-local')
    this.version(1).stores({
      chats: 'id, updatedAt, starred',
    })
  }
}

export const db = new GemmaChatDatabase()

export async function migrateLocalStorageChats() {
  if (localStorage.getItem(migrationKey)) return

  const stored = localStorage.getItem(CHAT_STORAGE_KEY)
  if (stored) {
    const chats = JSON.parse(stored) as SavedChat[]
    if (Array.isArray(chats) && chats.length > 0) {
      await db.chats.bulkPut(chats)
    }
  }

  localStorage.setItem(migrationKey, 'true')
}

export async function loadSavedChats() {
  await migrateLocalStorageChats()
  return db.chats.orderBy('updatedAt').reverse().toArray()
}

export async function saveChat(chat: SavedChat) {
  await db.chats.put(chat)
}

export async function deleteSavedChat(id: string) {
  await db.chats.delete(id)
}

export async function updateSavedChat(id: string, updates: Partial<SavedChat>) {
  await db.chats.update(id, updates)
}
