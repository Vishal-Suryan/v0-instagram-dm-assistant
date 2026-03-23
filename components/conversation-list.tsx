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
import type { Conversation } from '@/lib/types/database'
import { formatDistanceToNow } from 'date-fns'

interface ConversationListProps {
  selectedId?: string
  onSelect: (conversation: Conversation) => void
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function fetchConversations() {
      setIsLoading(true)
      
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false, nullsFirst: false })

      if (error) {
        console.error('Error fetching conversations:', error)
        setIsLoading(false)
        return
      }

      setConversations(conversationsData || [])
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

    return () => {
      supabase.removeChannel(conversationsChannel)
    }
  }, [supabase])

  const filteredConversations = conversations.filter((conv) =>
    conv.instagram_username.toLowerCase().includes(searchQuery.toLowerCase())
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
                  <AvatarImage src={conversation.instagram_avatar_url || undefined} />
                  <AvatarFallback>
                    {conversation.instagram_username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      'font-medium truncate',
                      conversation.unread_count > 0 && 'font-semibold'
                    )}>
                      @{conversation.instagram_username}
                    </span>
                    {conversation.last_message_at && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: false })}
                      </span>
                    )}
                  </div>
                  {conversation.last_message_preview && (
                    <p className={cn(
                      'text-sm truncate mt-1',
                      conversation.unread_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                    )}>
                      {conversation.last_message_preview}
                    </p>
                  )}
                </div>
                {conversation.unread_count > 0 && (
                  <div className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shrink-0">
                    {conversation.unread_count}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
