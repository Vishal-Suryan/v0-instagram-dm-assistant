'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty } from '@/components/ui/empty'
import { Search, MessageSquare } from 'lucide-react'
import type { Conversation, Message } from '@/lib/types/database'
import { formatDistanceToNow } from 'date-fns'

interface ConversationListProps {
  selectedId?: string
  onSelect: (conversation: Conversation) => void
}

interface ConversationWithLastMessage extends Conversation {
  last_message?: Message
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationWithLastMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function fetchConversations() {
      setIsLoading(true)
      
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false })

      if (error) {
        console.error('Error fetching conversations:', error)
        setIsLoading(false)
        return
      }

      // Fetch last message for each conversation
      const conversationsWithMessages = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)

          return {
            ...conv,
            last_message: messages?.[0] || undefined,
          }
        })
      )

      setConversations(conversationsWithMessages)
      setIsLoading(false)
    }

    fetchConversations()

    // Subscribe to realtime updates for conversations
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          fetchConversations()
        }
      )
      .subscribe()

    // Subscribe to realtime updates for messages (to update last message)
    const messagesChannel = supabase
      .channel('messages-for-list')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(conversationsChannel)
      supabase.removeChannel(messagesChannel)
    }
  }, [supabase])

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.contact_username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <Empty
            icon={MessageSquare}
            title="No conversations"
            description={searchQuery ? 'No conversations match your search' : 'Start a new conversation to get started'}
            className="h-full"
          />
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation)}
                className={cn(
                  'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors hover:bg-accent',
                  selectedId === conversation.id && 'bg-accent'
                )}
              >
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={conversation.contact_avatar_url || undefined} />
                  <AvatarFallback>
                    {conversation.contact_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      'font-medium truncate',
                      conversation.is_unread && 'font-semibold'
                    )}>
                      {conversation.contact_name}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: false })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    @{conversation.contact_username}
                  </p>
                  {conversation.last_message && (
                    <p className={cn(
                      'text-sm truncate mt-1',
                      conversation.is_unread ? 'text-foreground font-medium' : 'text-muted-foreground'
                    )}>
                      {conversation.last_message.sender_type === 'user' && 'You: '}
                      {conversation.last_message.content}
                    </p>
                  )}
                </div>
                {conversation.is_unread && (
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                )}
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
