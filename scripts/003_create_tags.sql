-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for user's tags
CREATE INDEX idx_tags_user_id ON public.tags(user_id);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "tags_select_own" ON public.tags 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tags_insert_own" ON public.tags 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tags_update_own" ON public.tags 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "tags_delete_own" ON public.tags 
  FOR DELETE USING (auth.uid() = user_id);

-- Create conversation_tags junction table
CREATE TABLE IF NOT EXISTS public.conversation_tags (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (conversation_id, tag_id)
);

-- Indexes
CREATE INDEX idx_conversation_tags_conversation ON public.conversation_tags(conversation_id);
CREATE INDEX idx_conversation_tags_tag ON public.conversation_tags(tag_id);

-- Enable RLS
ALTER TABLE public.conversation_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversation_tags (check via conversation ownership)
CREATE POLICY "conversation_tags_select" ON public.conversation_tags 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "conversation_tags_insert" ON public.conversation_tags 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "conversation_tags_delete" ON public.conversation_tags 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );
