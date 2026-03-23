import { generateText, Output } from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const suggestionsSchema = z.object({
  suggestions: z.array(z.string()).min(1).max(3).describe('3 contextual reply suggestions based on the conversation'),
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages, contactName } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Messages are required' }, { status: 400 })
    }

    // Format conversation history for the AI
    const conversationHistory = messages
      .map((msg: { sender_type: string; content: string }) => 
        `${msg.sender_type === 'user' ? 'You' : contactName}: ${msg.content}`
      )
      .join('\n')

    const { output } = await generateText({
      model: 'openai/gpt-4o-mini',
      output: Output.object({
        schema: suggestionsSchema,
      }),
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant helping to craft Instagram DM replies. Generate 3 short, contextual, and natural-sounding reply suggestions based on the conversation. Keep replies casual and friendly like typical Instagram DMs. Each suggestion should be under 100 characters.`,
        },
        {
          role: 'user',
          content: `Based on this Instagram DM conversation with ${contactName}, suggest 3 possible replies:\n\n${conversationHistory}`,
        },
      ],
    })

    return Response.json({ suggestions: output?.suggestions || [] })
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return Response.json({ error: 'Failed to generate suggestions' }, { status: 500 })
  }
}
