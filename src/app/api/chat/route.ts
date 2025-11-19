import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { createClient } from '@/lib/supabase/server'
import { runAgent } from '@/lib/langgraph/agent'
import {
  getOrCreateChat,
  saveMessage,
  updateChatTitle,
} from '@/lib/supabase/chat'

// Extract text content from UIMessage parts
function extractTextFromMessage(message: any): string {
  if (message.content) return message.content
  if (message.parts) {
    const textParts = message.parts.filter(
      (part: any) => part.type === 'text'
    ) as Array<{ type: 'text'; text: string }>
    return textParts.map(part => part.text).join('')
  }
  return ''
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      return new Response('Unauthorized', { status: 401 })
    }

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { messages, chatId } = await req.json()

    if (!messages || messages.length === 0) {
      return new Response('No messages provided', { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== 'user') {
      return new Response('Last message must be from user', { status: 400 })
    }

    const lastMessageContent = extractTextFromMessage(lastMessage)

    // Get or create chat
    const currentChatId = await getOrCreateChat(
      supabase,
      user.id,
      chatId || null,
      lastMessageContent
    )

    if (!currentChatId) {
      return new Response('Failed to create chat', { status: 500 })
    }

    // Always save user message - it's a new message from the user
    // currentChatId is correct (either existing chatId or newly created)
    await saveMessage(supabase, currentChatId, 'user', lastMessageContent)

    // Update chat title only if it's a new chat (chatId wasn't provided)
    if (!chatId) {
      const title = lastMessageContent.substring(0, 50)
      await updateChatTitle(supabase, currentChatId, title)
    }

    // Convert UIMessages to simple format for LangGraph
    const conversationHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role,
      content: extractTextFromMessage(msg),
    }))

    // Run LangGraph agent to get response (handles tool calling internally)
    const agentResponse = await runAgent(
      lastMessageContent,
      conversationHistory
    )

    const responseText =
      typeof agentResponse === 'string' ? agentResponse : String(agentResponse)

    // Save the assistant response immediately
    // This ensures it's saved even if streaming fails
    const saveResponse = async () => {
      await saveMessage(supabase, currentChatId, 'assistant', responseText)
    }

    // Save the assistant response immediately BEFORE returning the response
    // This ensures it completes before the request context ends
    try {
      await saveResponse()
    } catch (error) {
      console.error('Error saving assistant message:', error)
      // Continue anyway - we don't want to fail the request if save fails
    }

    // Use streamText to create a proper AI SDK stream format
    const result = streamText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      prompt: responseText,
    })

    // Use toTextStreamResponse - this creates a stream that useChat can parse
    // The custom transport will handle the stream parsing automatically
    return result.toTextStreamResponse({
      headers: {
        'X-Chat-Id': currentChatId,
      },
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
