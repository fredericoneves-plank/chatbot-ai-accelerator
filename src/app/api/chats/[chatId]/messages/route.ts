import { createClient } from '@/lib/supabase/server'
import { getChatMessages } from '@/lib/supabase/chat'

export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { chatId } = params
    if (!chatId) {
      return new Response('Chat ID is required', { status: 400 })
    }

    const messages = await getChatMessages(supabase, chatId)

    return Response.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
