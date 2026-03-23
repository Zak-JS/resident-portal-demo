-- Chat messages table for AI Concierge
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient querying by user
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only read their own messages
CREATE POLICY "Users can read own chat messages" ON chat_messages
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users can insert their own messages
CREATE POLICY "Users can insert own chat messages" ON chat_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Service role can insert assistant messages (for edge function)
CREATE POLICY "Service role can insert messages" ON chat_messages
  FOR INSERT TO service_role WITH CHECK (true);
