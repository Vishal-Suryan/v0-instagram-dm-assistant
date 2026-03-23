'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkles, RefreshCw } from 'lucide-react'
import type { Message } from '@/lib/types/database'

interface AiSuggestionsProps {
  messages: Message[]
  contactName: string
  onUseSuggestion: (suggestion: string) => void
}

export function AiSuggestions({ messages, contactName, onUseSuggestion }: AiSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastMessageId, setLastMessageId] = useState<string | null>(null)

  const fetchSuggestions = useCallback(async () => {
    if (messages.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, contactName }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions')
      }

      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (err) {
      console.error('Error fetching suggestions:', err)
      setError('Unable to generate suggestions')
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [messages, contactName])

  // Fetch suggestions when the last message changes (new message received)
  useEffect(() => {
    const latestMessage = messages[messages.length - 1]
    
    // Only fetch if there's a new message from the contact
    if (latestMessage && latestMessage.id !== lastMessageId && latestMessage.sender_type === 'contact') {
      setLastMessageId(latestMessage.id)
      fetchSuggestions()
    }
  }, [messages, lastMessageId, fetchSuggestions])

  if (messages.length === 0) {
    return null
  }

  // Don't show if the last message is from the user
  const lastMessage = messages[messages.length - 1]
  if (lastMessage?.sender_type === 'user') {
    return null
  }

  return (
    <div className="px-4 py-3 border-t bg-muted/30">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">AI Suggestions</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 ml-auto"
          onClick={fetchSuggestions}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex gap-2 flex-wrap">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-muted-foreground">{error}</p>
      ) : suggestions.length > 0 ? (
        <div className="flex gap-2 flex-wrap">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="secondary"
              size="sm"
              className="h-auto py-1.5 px-3 text-sm rounded-full"
              onClick={() => onUseSuggestion(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No suggestions available</p>
      )}
    </div>
  )
}
