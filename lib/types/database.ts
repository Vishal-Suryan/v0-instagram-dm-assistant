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
  contact_name: string
  contact_username: string
  contact_avatar_url: string | null
  is_unread: boolean
  last_message_at: string
  created_at: string
  updated_at: string
  tags?: Tag[]
  last_message?: Message
}

export interface Message {
  id: string
  conversation_id: string
  sender_type: 'user' | 'contact'
  content: string
  status: 'sending' | 'sent' | 'failed'
  created_at: string
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface ConversationTag {
  id: string
  conversation_id: string
  tag_id: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export interface ConversationWithDetails extends Conversation {
  messages: Message[]
  tags: Tag[]
}
