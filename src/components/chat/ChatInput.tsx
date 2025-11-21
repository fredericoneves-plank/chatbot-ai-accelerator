'use client'

import { KeyboardEvent, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ChatInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSendMessage: (e: FormEvent) => void
  disabled?: boolean
}

export function ChatInput({
  value,
  onChange,
  onSendMessage,
  disabled,
}: ChatInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.closest('form')
      if (form && !disabled && value.trim()) {
        const syntheticEvent = {
          preventDefault: () => {},
          stopPropagation: () => {},
        } as FormEvent<HTMLFormElement>
        onSendMessage(syntheticEvent)
      }
    }
  }

  return (
    <div className="border-t bg-background p-4">
      <form onSubmit={onSendMessage} className="max-w-3xl mx-auto flex gap-2">
        <Textarea
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
          className="min-h-[60px] max-h-[200px] resize-none"
          disabled={disabled}
        />
        <Button type="submit" disabled={!value.trim() || disabled}>
          Send
        </Button>
      </form>
    </div>
  )
}
