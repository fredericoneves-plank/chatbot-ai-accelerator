import { createClient } from '@/lib/supabase/server'
import { getChatHistory } from '@/lib/supabase/chat'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const history = await getChatHistory(supabase, user.id)

    return Response.json(history)
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
