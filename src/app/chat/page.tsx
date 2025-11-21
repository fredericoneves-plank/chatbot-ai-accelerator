'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { ChatMessages } from '@/components/chat/ChatMessages'
import { ChatInput } from '@/components/chat/ChatInput'
import type { UIMessage } from 'ai'

interface ChatHistory {
  id: string
  title: string
  createdAt: Date
}

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatIdRef = useRef<string | null>(null)

  const loadChatHistory = async () => {
    if (!user) return

    setIsLoadingHistory(true)
    try {
      const response = await fetch('/api/chats', {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const history = await response.json()
      setChatHistory(
        history.map((chat: any) => ({
          id: chat.id,
          title: chat.title,
          createdAt: new Date(chat.created_at),
        }))
      )
    } catch (error) {
      console.error('Error loading chat history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const loadChatMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const dbMessages = await response.json()
      const formattedMessages = dbMessages.map((msg: any) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        parts: [
          {
            type: 'text' as const,
            text: msg.content,
          },
        ],
      }))
      setMessages(formattedMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    } else if (user) {
      loadChatHistory()
    }
  }, [user, loading, router])

  const handleNewChat = () => {
    setCurrentChatId(null)
    chatIdRef.current = null
    setMessages([])
  }

  const handleSelectChat = async (chatId: string) => {
    setCurrentChatId(chatId)
    chatIdRef.current = chatId
    await loadChatMessages(chatId)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // Add user message optimistically
    const userMessageObj: UIMessage = {
      id: Date.now().toString(),
      role: 'user',
      parts: [
        {
          type: 'text',
          text: userMessage,
        },
      ],
    }
    setMessages(prev => [...prev, userMessageObj])

    try {
      const chatIdToSend = chatIdRef.current || currentChatId

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          messages: [...messages, userMessageObj],
          chatId: chatIdToSend,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      const chatId = response.headers.get('X-Chat-Id') || data.chatId

      if (chatId) {
        setCurrentChatId(chatId)
        chatIdRef.current = chatId
        if (chatId !== chatIdToSend) {
          loadChatHistory()
        }
      }

      // Add AI response to messages
      const aiMessageObj: UIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: data.message,
          },
        ],
      }
      setMessages(prev => [...prev, aiMessageObj])

      // Reload messages from DB to ensure consistency
      if (chatId) {
        await loadChatMessages(chatId)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove the user message that was added optimistically
      setMessages(prev => prev.slice(0, -1))
      // Show error to user
      alert('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <ChatMessages messages={messages} />
        <ChatInput
          value={input}
          onChange={handleInputChange}
          onSendMessage={handleSendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  )
}
