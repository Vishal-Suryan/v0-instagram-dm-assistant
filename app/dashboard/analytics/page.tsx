import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsDashboard } from './analytics-dashboard'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Fetch analytics data
  const [
    { count: totalConversations },
    { count: totalMessages },
    { count: unreadConversations },
    { data: recentMessages },
    { data: conversations },
  ] = await Promise.all([
    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', 
        (await supabase.from('conversations').select('id').eq('user_id', user.id)).data?.map(c => c.id) || []
      ),
    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_unread', true),
    supabase
      .from('messages')
      .select('created_at, sender_type')
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('conversations')
      .select('created_at, last_message_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  // Process data for charts
  const messagesPerDay = processMessagesPerDay(recentMessages || [])
  const responseTimeData = calculateAverageResponseTime(conversations || [])

  return (
    <AnalyticsDashboard
      totalConversations={totalConversations || 0}
      totalMessages={totalMessages || 0}
      unreadConversations={unreadConversations || 0}
      messagesPerDay={messagesPerDay}
      responseTimeData={responseTimeData}
    />
  )
}

function processMessagesPerDay(messages: { created_at: string; sender_type: string }[]) {
  const days: Record<string, { date: string; sent: number; received: number }> = {}
  
  // Get last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    days[dateStr] = { date: dateStr, sent: 0, received: 0 }
  }

  messages.forEach((msg) => {
    const dateStr = msg.created_at.split('T')[0]
    if (days[dateStr]) {
      if (msg.sender_type === 'user') {
        days[dateStr].sent++
      } else {
        days[dateStr].received++
      }
    }
  })

  return Object.values(days)
}

function calculateAverageResponseTime(conversations: { created_at: string; last_message_at: string }[]) {
  // Generate mock response time data for demonstration
  const data = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      avgTime: Math.floor(Math.random() * 30) + 5, // 5-35 minutes
    })
  }
  return data
}
