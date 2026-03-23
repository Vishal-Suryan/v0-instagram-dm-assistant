export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user_id: string
  instagram_username: string
  instagram_user_id: string | null
  instagram_avatar_url: string | null
  last_message_at: string
  last_message_preview: string | null
  unread_count: number
  created_at: string
  updated_at: string
  tags?: Tag[]
}

export interface Message {
  id: string
  conversation_id: string
  user_id: string
  sender_type: 'user' | 'contact'
  content: string
  status: 'sending' | 'sent' | 'failed'
  is_ai_suggested: boolean
  created_at: string
  sent_at: string | null
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface ConversationTag {
  conversation_id: string
  tag_id: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  conversation_id: string | null
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export interface ConversationWithDetails extends Conversation {
  messages: Message[]
  tags: Tag[]
}
