-- Ticket responses/timeline table
CREATE TABLE ticket_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES maintenance_tickets(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_staff BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ticket_responses ENABLE ROW LEVEL SECURITY;

-- Users can view responses on their tickets
CREATE POLICY "Users can view responses on their tickets"
  ON ticket_responses FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM maintenance_tickets WHERE user_id = auth.uid()
    )
  );

-- Service role can insert responses (for mock responses)
CREATE POLICY "Service role can insert responses"
  ON ticket_responses FOR INSERT
  WITH CHECK (true);

-- Users can mark responses as read
CREATE POLICY "Users can update read status"
  ON ticket_responses FOR UPDATE
  USING (
    ticket_id IN (
      SELECT id FROM maintenance_tickets WHERE user_id = auth.uid()
    )
  );
