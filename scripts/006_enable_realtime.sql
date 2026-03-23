-- Enable Supabase Realtime for messages and notifications tables
-- This allows live updates when new messages or notifications arrive

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
