-- Add DELETE policy for maintenance_tickets
CREATE POLICY "Users can delete own tickets" ON maintenance_tickets
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add DELETE policy for ticket_responses (users can delete responses on their tickets)
CREATE POLICY "Users can delete responses on their tickets"
  ON ticket_responses FOR DELETE
  USING (
    ticket_id IN (
      SELECT id FROM maintenance_tickets WHERE user_id = auth.uid()
    )
  );
