-- Seed demo data for Instagram DM Assistant
-- This script creates sample conversations and messages for demo/testing purposes
-- It uses the currently authenticated user (you need to run this after signing up)

-- First, create some default tags that any user can use as templates
-- Users will need to create their own tags, but we can add a function to auto-create default tags

-- Create a function to seed demo data for a specific user
CREATE OR REPLACE FUNCTION seed_demo_data_for_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conv1_id uuid := gen_random_uuid();
  conv2_id uuid := gen_random_uuid();
  conv3_id uuid := gen_random_uuid();
  conv4_id uuid := gen_random_uuid();
  tag_important_id uuid := gen_random_uuid();
  tag_leads_id uuid := gen_random_uuid();
  tag_support_id uuid := gen_random_uuid();
BEGIN
  -- Create default tags for the user
  INSERT INTO tags (id, user_id, name, color) VALUES
    (tag_important_id, target_user_id, 'Important', '#ef4444'),
    (tag_leads_id, target_user_id, 'Leads', '#22c55e'),
    (tag_support_id, target_user_id, 'Support', '#3b82f6')
  ON CONFLICT DO NOTHING;

  -- Create sample conversations
  INSERT INTO conversations (id, user_id, instagram_username, instagram_user_id, instagram_avatar_url, last_message_at, last_message_preview, unread_count) VALUES
    (conv1_id, target_user_id, 'sarah_designs', 'mock_001', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', NOW() - INTERVAL '5 minutes', 'That sounds great! When can we schedule a call?', 2),
    (conv2_id, target_user_id, 'tech_startup_joe', 'mock_002', 'https://api.dicebear.com/7.x/avataaars/svg?seed=joe', NOW() - INTERVAL '1 hour', 'Thanks for the quick response!', 0),
    (conv3_id, target_user_id, 'creative_maria', 'mock_003', 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria', NOW() - INTERVAL '3 hours', 'I love your work! Would you be interested in a collab?', 1),
    (conv4_id, target_user_id, 'fitness_mike', 'mock_004', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', NOW() - INTERVAL '1 day', 'Sure, let me know the details', 0)
  ON CONFLICT DO NOTHING;

  -- Add tags to conversations
  INSERT INTO conversation_tags (conversation_id, tag_id) VALUES
    (conv1_id, tag_leads_id),
    (conv1_id, tag_important_id),
    (conv3_id, tag_leads_id)
  ON CONFLICT DO NOTHING;

  -- Create sample messages for conversation 1 (sarah_designs)
  INSERT INTO messages (conversation_id, user_id, content, sender_type, status, is_ai_suggested, created_at) VALUES
    (conv1_id, target_user_id, 'Hey! I saw your portfolio and I''m really impressed with your design work.', 'contact', 'sent', false, NOW() - INTERVAL '30 minutes'),
    (conv1_id, target_user_id, 'Thank you so much! I appreciate you reaching out. What kind of project did you have in mind?', 'user', 'sent', false, NOW() - INTERVAL '25 minutes'),
    (conv1_id, target_user_id, 'I''m looking for someone to redesign our company website. We want something modern and clean.', 'contact', 'sent', false, NOW() - INTERVAL '20 minutes'),
    (conv1_id, target_user_id, 'That sounds like a great project! I''d love to hear more about your vision and requirements.', 'user', 'sent', true, NOW() - INTERVAL '15 minutes'),
    (conv1_id, target_user_id, 'That sounds great! When can we schedule a call?', 'contact', 'sent', false, NOW() - INTERVAL '5 minutes')
  ON CONFLICT DO NOTHING;

  -- Create sample messages for conversation 2 (tech_startup_joe)
  INSERT INTO messages (conversation_id, user_id, content, sender_type, status, is_ai_suggested, created_at) VALUES
    (conv2_id, target_user_id, 'Hi there! Quick question about your services...', 'contact', 'sent', false, NOW() - INTERVAL '2 hours'),
    (conv2_id, target_user_id, 'Of course! Happy to help. What would you like to know?', 'user', 'sent', false, NOW() - INTERVAL '1 hour 45 minutes'),
    (conv2_id, target_user_id, 'Do you offer consultation services for startups?', 'contact', 'sent', false, NOW() - INTERVAL '1 hour 30 minutes'),
    (conv2_id, target_user_id, 'Yes, I do! I offer both hourly consultations and ongoing advisory services. Would you like me to send you my rates?', 'user', 'sent', false, NOW() - INTERVAL '1 hour 15 minutes'),
    (conv2_id, target_user_id, 'Thanks for the quick response!', 'contact', 'sent', false, NOW() - INTERVAL '1 hour')
  ON CONFLICT DO NOTHING;

  -- Create sample messages for conversation 3 (creative_maria)
  INSERT INTO messages (conversation_id, user_id, content, sender_type, status, is_ai_suggested, created_at) VALUES
    (conv3_id, target_user_id, 'Hi! I''ve been following your content for a while now.', 'contact', 'sent', false, NOW() - INTERVAL '4 hours'),
    (conv3_id, target_user_id, 'Thank you for following! That means a lot.', 'user', 'sent', false, NOW() - INTERVAL '3 hours 45 minutes'),
    (conv3_id, target_user_id, 'I love your work! Would you be interested in a collab?', 'contact', 'sent', false, NOW() - INTERVAL '3 hours')
  ON CONFLICT DO NOTHING;

  -- Create sample messages for conversation 4 (fitness_mike)
  INSERT INTO messages (conversation_id, user_id, content, sender_type, status, is_ai_suggested, created_at) VALUES
    (conv4_id, target_user_id, 'Hey! I saw your post about fitness apps. Really insightful!', 'contact', 'sent', false, NOW() - INTERVAL '2 days'),
    (conv4_id, target_user_id, 'Thanks Mike! I''m passionate about the intersection of tech and fitness.', 'user', 'sent', false, NOW() - INTERVAL '1 day 20 hours'),
    (conv4_id, target_user_id, 'Would you be open to reviewing my new fitness tracking app?', 'contact', 'sent', false, NOW() - INTERVAL '1 day 10 hours'),
    (conv4_id, target_user_id, 'I''d be happy to take a look! Can you send me some details about the app?', 'user', 'sent', false, NOW() - INTERVAL '1 day 5 hours'),
    (conv4_id, target_user_id, 'Sure, let me know the details', 'contact', 'sent', false, NOW() - INTERVAL '1 day')
  ON CONFLICT DO NOTHING;

  -- Create a welcome notification
  INSERT INTO notifications (user_id, type, title, message, is_read) VALUES
    (target_user_id, 'welcome', 'Welcome to InstaAssist!', 'We''ve set up some demo conversations and tags to help you get started. Feel free to explore!', false)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Note: To seed data for a user, call:
-- SELECT seed_demo_data_for_user('user-uuid-here');
-- Or modify the app to call this when a new user signs up
