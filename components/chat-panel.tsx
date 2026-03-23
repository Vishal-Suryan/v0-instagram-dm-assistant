'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { AiSuggestions } from '@/components/ai-suggestions'
import { Send, Check, AlertCircle, Loader2 } from 'lucide-react'
import type { Conversation, Message } from '@/lib/types/database'
import { format } from 'date-fns'

interface ChatPanelProps {
  conversation: Conversation
}

export function ChatPanel({ conversation }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    async function fetchMessages() {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
      } else {
        setMessages(data || [])
      }
      
      setIsLoading(false)

      // Mark conversation as read
      await supabase
        .from('conversations')
        .update({ is_unread: false })
        .eq('id', conversation.id)
    }

    fetchMessages()

    // Subscribe to realtime message updates
    const channel = supabase
      .channel(`messages-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? (payload.new as Message) : msg
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation.id, supabase])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    const tempId = crypto.randomUUID()
    const tempMessage: Message = {
      id: tempId,
      conversation_id: conversation.id,
      sender_type: 'user',
      content: newMessage.trim(),
      status: 'sending',
      created_at: new Date().toISOString(),
    }

    // Optimistic update
    setMessages((prev) => [...prev, tempMessage])
    setNewMessage('')
    setIsSending(true)

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_type: 'user',
        content: tempMessage.content,
        status: 'sent',
      })
      .select()
      .single()

    if (error) {
      // Update to failed status
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: 'failed' as const } : msg
        )
      )
    } else {
      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? data : msg))
      )
    }

    setIsSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleUseSuggestion = (suggestion: string) => {
    setNewMessage(suggestion)
  }

  const getMessageStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-destructive" />
    }
  }

  // Get last 5 messages for AI context
  const recentMessages = messages.slice(-5)

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 p-4 border-b">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
              <Skeleton className={cn('h-16 rounded-lg', i % 2 === 0 ? 'w-64' : 'w-48')} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.contact_avatar_url || undefined} />
          <AvatarFallback>
            {conversation.contact_name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{conversation.contact_name}</h2>
          <p className="text-sm text-muted-foreground">@{conversation.contact_username}</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.sender_type === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[70%] rounded-2xl px-4 py-2',
                  message.sender_type === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted rounded-bl-md'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className={cn(
                  'flex items-center gap-1 mt-1',
                  message.sender_type === 'user' ? 'justify-end' : 'justify-start'
                )}>
                  <span className={cn(
                    'text-xs',
                    message.sender_type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}>
                    {format(new Date(message.created_at), 'HH:mm')}
                  </span>
                  {message.sender_type === 'user' && getMessageStatusIcon(message.status)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* AI Suggestions */}
      <AiSuggestions
        messages={recentMessages}
        contactName={conversation.contact_name}
        onUseSuggestion={handleUseSuggestion}
      />

      {/* Input */}
      <div className="p-4 border-t shrink-0">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
