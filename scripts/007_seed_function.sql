-- Create a function to seed mock data for a user
-- This function is called via API when a new user wants demo data

CREATE OR REPLACE FUNCTION public.seed_demo_data(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv_id UUID;
  v_contact RECORD;
  v_message RECORD;
BEGIN
  -- Check if user already has conversations (don't re-seed)
  IF EXISTS (SELECT 1 FROM conversations WHERE user_id = p_user_id) THEN
    RETURN;
  END IF;

  -- Sample contacts data
  FOR v_contact IN 
    SELECT * FROM (VALUES
      ('Emma Wilson', 'emmawilson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma'),
      ('Alex Chen', 'alexchen_', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'),
      ('Sarah Johnson', 'sarahj_official', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'),
      ('Mike Peters', 'mikepeters99', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike'),
      ('Lisa Martinez', 'lisamartinez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa'),
      ('James Brown', 'jamesbrown_', 'https://api.dicebear.com/7.x/avataaars/svg?seed=james'),
      ('Emily Davis', 'emilyd_gram', 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily')
    ) AS t(name, username, avatar)
  LOOP
    -- Create conversation
    INSERT INTO conversations (user_id, contact_name, contact_username, contact_avatar_url, is_unread, last_message_at)
    VALUES (
      p_user_id, 
      v_contact.name, 
      v_contact.username, 
      v_contact.avatar,
      (random() > 0.5),
      now() - (random() * interval '7 days')
    )
    RETURNING id INTO v_conv_id;

    -- Add messages for this conversation
    FOR v_message IN 
      SELECT * FROM (VALUES
        ('contact', 'Hey! How are you?'),
        ('user', 'Hi! Im doing great, thanks for asking! How about you?'),
        ('contact', 'Pretty good! I saw your recent post, it was amazing!'),
        ('user', 'Thank you so much! I spent a lot of time on it'),
        ('contact', 'It really shows. Would love to collaborate sometime!'),
        ('user', 'That sounds awesome! What did you have in mind?'),
        ('contact', 'Maybe we could do a joint live stream or something?')
      ) AS t(sender, content)
    LOOP
      INSERT INTO messages (conversation_id, sender_type, content, status, created_at)
      VALUES (
        v_conv_id,
        v_message.sender,
        v_message.content,
        'sent',
        now() - (random() * interval '2 days')
      );
    END LOOP;
  END LOOP;

  -- Create some default tags for the user
  INSERT INTO tags (user_id, name, color) VALUES
    (p_user_id, 'VIP', '#ef4444'),
    (p_user_id, 'Follow Up', '#f59e0b'),
    (p_user_id, 'Collaboration', '#10b981'),
    (p_user_id, 'Sponsor', '#6366f1'),
    (p_user_id, 'Friend', '#8b5cf6')
  ON CONFLICT DO NOTHING;

END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.seed_demo_data(UUID) TO authenticated;
