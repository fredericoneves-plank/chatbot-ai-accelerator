'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface ChatHistory {
  id: string
  title: string
  createdAt: Date
}

interface ChatSidebarProps {
  chatHistory: ChatHistory[]
  currentChatId: string | null
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
}

export function ChatSidebar({
  chatHistory,
  currentChatId,
  onNewChat,
  onSelectChat,
}: ChatSidebarProps) {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="flex flex-col h-screen w-64 border-r bg-background">
      <div className="p-4">
        <Button onClick={onNewChat} className="w-full">
          + New Chat
        </Button>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="p-2">
          {chatHistory.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No chat history
            </div>
          ) : (
            <div className="space-y-1">
              {chatHistory.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    currentChatId === chat.id
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <div className="truncate">{chat.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(chat.createdAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
      <Separator />
      <div className="p-4">
        <Button variant="outline" onClick={handleSignOut} className="w-full">
          Sign Out
        </Button>
      </div>
    </div>
  )
}
