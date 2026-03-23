import { supabase } from "./supabase";
import type { MaintenanceTicket } from "../types";

export async function rsvpToEvent(eventId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("event_rsvps").insert({
    user_id: user.id,
    event_id: eventId,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("You have already RSVPed to this event");
    }
    throw error;
  }
}

export async function cancelRsvp(eventId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("event_rsvps")
    .delete()
    .eq("user_id", user.id)
    .eq("event_id", eventId);

  if (error) throw error;
}

export interface CreateTicketData {
  title: string;
  category: string;
  description: string;
}

export async function createMaintenanceTicket(
  data: CreateTicketData,
): Promise<MaintenanceTicket> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get user's property
  const { data: profile } = await supabase
    .from("profiles")
    .select("property_id")
    .eq("id", user.id)
    .single();

  const { data: ticket, error } = await supabase
    .from("maintenance_tickets")
    .insert({
      user_id: user.id,
      property_id: profile?.property_id,
      title: data.title,
      category: data.category,
      description: data.description,
      status: "open",
    })
    .select()
    .single();

  if (error) throw error;

  // Schedule a mock staff response after 15 seconds
  scheduleMockResponse(ticket.id, data.title);

  return ticket;
}

// Mock staff responses for demo purposes
const MOCK_RESPONSES = [
  "Thanks for reporting this issue. I've assigned a technician to look into it. They should be in touch within 24 hours.",
  "We've received your request and will prioritize it. A maintenance team member will visit your unit tomorrow between 9am-12pm.",
  "Thank you for letting us know. This has been logged and our team will address it shortly. We'll update you once resolved.",
  "Got it! I've escalated this to our maintenance supervisor. Expect someone to contact you within the next few hours.",
];

export async function deleteMaintenanceTicket(ticketId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Delete associated responses first
  await supabase.from("ticket_responses").delete().eq("ticket_id", ticketId);

  // Delete the ticket
  const { error } = await supabase
    .from("maintenance_tickets")
    .delete()
    .eq("id", ticketId)
    .eq("user_id", user.id);

  if (error) throw error;
}

function scheduleMockResponse(ticketId: string, ticketTitle: string) {
  setTimeout(async () => {
    const randomResponse =
      MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];

    try {
      await supabase.from("ticket_responses").insert({
        ticket_id: ticketId,
        message: randomResponse,
        is_staff: true,
        is_read: false,
      });

      console.log("Mock response added for ticket:", ticketId);
    } catch (err) {
      console.error("Failed to add mock response:", err);
    }
  }, 15000); // 15 seconds
}
