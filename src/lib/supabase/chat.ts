import type { SupabaseClient } from '@supabase/supabase-js'

export interface Chat {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  chat_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export async function getChatHistory(
  client: SupabaseClient,
  userId: string
): Promise<Chat[]> {
  const { data, error } = await client
    .from('chats')
    .select('id, user_id, title, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching chat history:', error)
    return []
  }

  return data || []
}

export async function getChatMessages(
  client: SupabaseClient,
  chatId: string
): Promise<Message[]> {
  const { data, error } = await client
    .from('messages')
    .select('id, chat_id, role, content, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return data || []
}

export async function createChat(
  client: SupabaseClient,
  userId: string,
  title: string
): Promise<string | null> {
  const { data, error } = await client
    .from('chats')
    .insert({
      user_id: userId,
      title,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating chat:', error)
    return null
  }

  return data.id
}

export async function saveMessage(
  client: SupabaseClient,
  chatId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<boolean> {
  const { error } = await client.from('messages').insert({
    chat_id: chatId,
    role,
    content,
  })

  if (error) {
    console.error('Error saving message:', error)
    return false
  }

  return true
}

export async function updateChatTitle(
  client: SupabaseClient,
  chatId: string,
  title: string
): Promise<boolean> {
  const { error } = await client
    .from('chats')
    .update({ title })
    .eq('id', chatId)

  if (error) {
    console.error('Error updating chat title:', error)
    return false
  }

  return true
}

export async function getOrCreateChat(
  client: SupabaseClient,
  userId: string,
  chatId: string | null,
  firstMessage: string
): Promise<string> {
  if (chatId) {
    return chatId
  }

  const title = firstMessage.substring(0, 50)
  const newChatId = await createChat(client, userId, title)
  return newChatId || ''
}
