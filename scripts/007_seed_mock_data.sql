-- Function to seed mock data for a user
-- This creates sample Instagram conversations for demo purposes

CREATE OR REPLACE FUNCTION public.seed_user_demo_data(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conv1_id UUID;
  conv2_id UUID;
  conv3_id UUID;
  conv4_id UUID;
  conv5_id UUID;
BEGIN
  -- Only seed if user has no conversations
  IF EXISTS (SELECT 1 FROM public.conversations WHERE user_id = target_user_id) THEN
    RETURN;
  END IF;

  -- Create sample conversations
  INSERT INTO public.conversations (id, user_id, contact_name, contact_username, instagram_user_id, contact_avatar_url, last_message_preview, is_unread, last_message_at)
  VALUES 
    (gen_random_uuid(), target_user_id, 'Sarah Designs', 'sarah_designs', 'ig_001', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 'Love your latest post! Can we collab?', true, NOW() - INTERVAL '5 minutes')
  RETURNING id INTO conv1_id;

  INSERT INTO public.conversations (id, user_id, contact_name, contact_username, instagram_user_id, contact_avatar_url, last_message_preview, is_unread, last_message_at)
  VALUES 
    (gen_random_uuid(), target_user_id, 'Tech Mike', 'tech_mike', 'ig_002', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', 'Thanks for the quick response!', false, NOW() - INTERVAL '2 hours')
  RETURNING id INTO conv2_id;

  INSERT INTO public.conversations (id, user_id, contact_name, contact_username, instagram_user_id, contact_avatar_url, last_message_preview, is_unread, last_message_at)
  VALUES 
    (gen_random_uuid(), target_user_id, 'Emma Fitness', 'fitness_emma', 'ig_003', 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', 'What are your rates for sponsored posts?', true, NOW() - INTERVAL '1 day')
  RETURNING id INTO conv3_id;

  INSERT INTO public.conversations (id, user_id, contact_name, contact_username, instagram_user_id, contact_avatar_url, last_message_preview, is_unread, last_message_at)
  VALUES 
    (gen_random_uuid(), target_user_id, 'Brand Official', 'brand_official', 'ig_004', 'https://api.dicebear.com/7.x/avataaars/svg?seed=brand', 'We would love to discuss a partnership', true, NOW() - INTERVAL '3 days')
  RETURNING id INTO conv4_id;

  INSERT INTO public.conversations (id, user_id, contact_name, contact_username, instagram_user_id, contact_avatar_url, last_message_preview, is_unread, last_message_at)
  VALUES 
    (gen_random_uuid(), target_user_id, 'Alex Photo', 'photo_alex', 'ig_005', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', 'Great meeting you at the event!', false, NOW() - INTERVAL '1 week')
  RETURNING id INTO conv5_id;

  -- Seed messages for conversation 1 (sarah_designs)
  INSERT INTO public.messages (conversation_id, user_id, content, sender_type, status, created_at)
  VALUES 
    (conv1_id, target_user_id, 'Hey! I saw your profile and your work is amazing!', 'contact', 'sent', NOW() - INTERVAL '1 hour'),
    (conv1_id, target_user_id, 'Thank you so much! I really appreciate it.', 'user', 'sent', NOW() - INTERVAL '55 minutes'),
    (conv1_id, target_user_id, 'I was wondering if you would be interested in a collaboration?', 'contact', 'sent', NOW() - INTERVAL '30 minutes'),
    (conv1_id, target_user_id, 'Love your latest post! Can we collab?', 'contact', 'sent', NOW() - INTERVAL '5 minutes');

  -- Seed messages for conversation 2 (tech_mike)
  INSERT INTO public.messages (conversation_id, user_id, content, sender_type, status, created_at)
  VALUES 
    (conv2_id, target_user_id, 'Hi! Quick question about your recent tutorial.', 'contact', 'sent', NOW() - INTERVAL '5 hours'),
    (conv2_id, target_user_id, 'Sure, what would you like to know?', 'user', 'sent', NOW() - INTERVAL '4 hours'),
    (conv2_id, target_user_id, 'How did you achieve that lighting effect?', 'contact', 'sent', NOW() - INTERVAL '3 hours'),
    (conv2_id, target_user_id, 'I used a combination of natural light and a softbox at 45 degrees. Happy to share more details!', 'user', 'sent', NOW() - INTERVAL '2 hours 30 minutes'),
    (conv2_id, target_user_id, 'Thanks for the quick response!', 'contact', 'sent', NOW() - INTERVAL '2 hours');

  -- Seed messages for conversation 3 (fitness_emma)
  INSERT INTO public.messages (conversation_id, user_id, content, sender_type, status, created_at)
  VALUES 
    (conv3_id, target_user_id, 'Hello! I represent a fitness brand and we love your content.', 'contact', 'sent', NOW() - INTERVAL '2 days'),
    (conv3_id, target_user_id, 'Hi Emma! Thanks for reaching out. What did you have in mind?', 'user', 'sent', NOW() - INTERVAL '1 day 12 hours'),
    (conv3_id, target_user_id, 'What are your rates for sponsored posts?', 'contact', 'sent', NOW() - INTERVAL '1 day');

  -- Seed messages for conversation 4 (brand_official)
  INSERT INTO public.messages (conversation_id, user_id, content, sender_type, status, created_at)
  VALUES 
    (conv4_id, target_user_id, 'Good afternoon! We have been following your journey.', 'contact', 'sent', NOW() - INTERVAL '5 days'),
    (conv4_id, target_user_id, 'Your engagement rates are impressive!', 'contact', 'sent', NOW() - INTERVAL '4 days'),
    (conv4_id, target_user_id, 'We would love to discuss a partnership', 'contact', 'sent', NOW() - INTERVAL '3 days');

  -- Seed messages for conversation 5 (photo_alex)
  INSERT INTO public.messages (conversation_id, user_id, content, sender_type, status, created_at)
  VALUES 
    (conv5_id, target_user_id, 'It was so nice meeting you at the photography event!', 'contact', 'sent', NOW() - INTERVAL '1 week 2 days'),
    (conv5_id, target_user_id, 'Same here! Your portfolio is incredible.', 'user', 'sent', NOW() - INTERVAL '1 week 1 day'),
    (conv5_id, target_user_id, 'We should definitely shoot together sometime!', 'contact', 'sent', NOW() - INTERVAL '1 week'),
    (conv5_id, target_user_id, 'Great meeting you at the event!', 'user', 'sent', NOW() - INTERVAL '1 week');

  -- Create some default tags for the user
  INSERT INTO public.tags (user_id, name, color)
  VALUES 
    (target_user_id, 'VIP', '#ef4444'),
    (target_user_id, 'Brand Deal', '#8b5cf6'),
    (target_user_id, 'Collaboration', '#06b6d4'),
    (target_user_id, 'Follow Up', '#f59e0b');

END;
$$;
