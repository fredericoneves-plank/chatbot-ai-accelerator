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
  let currentChatId: string | null = null
  let userMessageSaved = false

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
    currentChatId = await getOrCreateChat(
      supabase,
      user.id,
      chatId || null,
      lastMessageContent
    )

    if (!currentChatId) {
      return new Response('Failed to create chat', { status: 500 })
    }

    // Save user message - wrapped in try-catch to handle errors
    try {
      await saveMessage(supabase, currentChatId, 'user', lastMessageContent)
      userMessageSaved = true
    } catch (error) {
      console.error('Error saving user message:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to save user message' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Update chat title only if it's a new chat (chatId wasn't provided)
    if (!chatId) {
      try {
        const title = lastMessageContent.substring(0, 50)
        await updateChatTitle(supabase, currentChatId, title)
      } catch (error) {
        console.error('Error updating chat title:', error)
        // Don't fail the request if title update fails
      }
    }

    // Convert UIMessages to simple format for LangGraph
    const conversationHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role,
      content: extractTextFromMessage(msg),
    }))

    // Run the agent with invoke() to get the full response
    let aiResponse: string
    try {
      aiResponse = await runAgent(lastMessageContent, conversationHistory)
    } catch (error) {
      console.error('Error running agent:', error)
      // If agent fails, we should not save the user message
      // Since it's already saved, we'll return an error
      // In a production app, you might want to delete the user message
      return new Response(
        JSON.stringify({ error: 'Failed to generate AI response' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Save the AI response - wrapped in try-catch
    try {
      await saveMessage(supabase, currentChatId, 'assistant', aiResponse)
    } catch (error) {
      console.error('Error saving assistant message:', error)
      // If saving AI response fails, we still return the response to the user
      // but log the error
    }

    // Return JSON response with the AI message
    return new Response(
      JSON.stringify({
        message: aiResponse,
        chatId: currentChatId,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Chat-Id': currentChatId,
        },
      }
    )
  } catch (error) {
    console.error('Error in chat API:', error)

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
