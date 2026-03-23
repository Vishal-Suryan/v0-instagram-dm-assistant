-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  contact_username TEXT NOT NULL,
  contact_avatar_url TEXT,
  instagram_user_id TEXT,
  is_unread BOOLEAN DEFAULT true,
  last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_message_preview TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user_last_message ON public.conversations(user_id, last_message_at DESC);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only access their own conversations
DROP POLICY IF EXISTS "conversations_select_own" ON public.conversations;
CREATE POLICY "conversations_select_own" ON public.conversations 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "conversations_insert_own" ON public.conversations;
CREATE POLICY "conversations_insert_own" ON public.conversations 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "conversations_update_own" ON public.conversations;
CREATE POLICY "conversations_update_own" ON public.conversations 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "conversations_delete_own" ON public.conversations;
CREATE POLICY "conversations_delete_own" ON public.conversations 
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS conversations_updated_at ON public.conversations;
CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
