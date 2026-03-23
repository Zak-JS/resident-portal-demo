import { supabase } from "../supabase";
import type {
  ConciergeContext,
  EventContext,
  PropertyContext,
  FeatureFlags,
  TicketContext,
} from "../../types/chat";
import { TICKET_CATEGORIES } from "../../types";

const DEFAULT_FEATURES: FeatureFlags = {
  canRsvpToEvents: true,
  canSubmitMaintenanceTickets: true,
  hasCommunityChat: true,
  hasPayments: false,
  hasAmenityBooking: false,
};

export async function buildConciergeContext(): Promise<ConciergeContext> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let property: PropertyContext | null = null;
  let events: EventContext[] = [];
  let tickets: TicketContext[] = [];

  if (user) {
    // Get user's property
    const { data: profile } = await supabase
      .from("profiles")
      .select("property_id, property:properties(*)")
      .eq("id", user.id)
      .single();

    if (profile?.property) {
      const p = profile.property as {
        name: string;
        city: string | null;
        address: string | null;
      };
      property = {
        name: p.name,
        city: p.city,
        address: p.address,
      };
    }

    // Get upcoming events (next 5)
    const { data: upcomingEvents } = await supabase
      .from("events")
      .select("title, starts_at, location, description")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(5);

    if (upcomingEvents) {
      events = upcomingEvents.map((e) => ({
        title: e.title,
        startsAt: e.starts_at,
        location: e.location,
        description: e.description,
      }));
    }

    // Get user's maintenance tickets (recent 5)
    const { data: userTickets } = await supabase
      .from("maintenance_tickets")
      .select("title, category, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (userTickets) {
      tickets = userTickets.map((t) => ({
        title: t.title,
        category: t.category,
        status: t.status,
        createdAt: t.created_at || new Date().toISOString(),
      }));
    }
  }

  return {
    property,
    events,
    tickets,
    features: DEFAULT_FEATURES,
    maintenanceCategories: [...TICKET_CATEGORIES],
  };
}
