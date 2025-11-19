'use client'

import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { UIMessage } from 'ai'

interface ChatMessagesProps {
  messages: UIMessage[]
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Filter out system and tool messages, only show user and assistant
  const displayMessages = messages.filter(
    msg => msg.role === 'user' || msg.role === 'assistant'
  )

  // Extract text content from UIMessage parts
  const getMessageText = (message: UIMessage): string => {
    const textParts = message.parts.filter(
      part => part.type === 'text'
    ) as Array<{ type: 'text'; text: string }>
    return textParts.map(part => part.text).join('')
  }

  return (
    <ScrollArea className="flex-1">
      <div className="px-4">
        <div className="max-w-3xl mx-auto py-8 space-y-6">
          {displayMessages.length === 0 ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center text-muted-foreground">
                <h2 className="text-2xl font-semibold mb-2">
                  How can I help you today?
                </h2>
                <p>Start a conversation by typing a message below.</p>
                <p className="text-sm mt-2">
                  I can help you with weather information and news!
                </p>
              </div>
            </div>
          ) : (
            <>
              {displayMessages.map(message => {
                const textContent = getMessageText(message)
                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-4',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'rounded-lg px-4 py-3 max-w-[80%]',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      <p className="whitespace-pre-wrap">{textContent}</p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>
    </ScrollArea>
  )
}
