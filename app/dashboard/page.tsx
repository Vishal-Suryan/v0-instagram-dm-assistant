'use client'

import { useState } from 'react'
import { ConversationList } from '@/components/conversation-list'
import { ChatPanel } from '@/components/chat-panel'
import { Empty } from '@/components/ui/empty'
import { MessageSquare } from 'lucide-react'
import type { Conversation } from '@/lib/types/database'

export default function DashboardPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  return (
    <div className="flex h-full">
      {/* Conversation List - Left Panel */}
      <div className="w-80 border-r shrink-0 flex flex-col">
        <ConversationList
          selectedId={selectedConversation?.id}
          onSelect={setSelectedConversation}
        />
      </div>

      {/* Chat Panel - Right Panel */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatPanel conversation={selectedConversation} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Empty
              icon={MessageSquare}
              title="Select a conversation"
              description="Choose a conversation from the list to start messaging"
            />
          </div>
        )}
      </div>
    </div>
  )
}
