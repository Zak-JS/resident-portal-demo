import { supabase } from "./supabase";
import type {
  Profile,
  Property,
  Event,
  EventRsvp,
  MaintenanceTicket,
  DashboardData,
} from "../types";

export async function getCurrentProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*, property:properties(*)")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  // If no profile exists yet, return a minimal profile from auth data
  if (!data) {
    return {
      id: user.id,
      full_name:
        user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      email: user.email || "",
      property_id: null,
      unit_label: null,
      created_at: user.created_at,
    } as Profile;
  }

  return data;
}

export async function getProperty(
  propertyId: string,
): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .single();

  if (error) {
    console.error("Error fetching property:", error);
    return null;
  }

  return data;
}

export async function getEvents(propertyId?: string): Promise<Event[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("events")
    .select("*")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  if (propertyId) {
    query = query.eq("property_id", propertyId);
  }

  const { data: events, error } = await query;

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  if (!user || !events) return events || [];

  // Get user's RSVPs
  const { data: rsvps } = await supabase
    .from("event_rsvps")
    .select("event_id")
    .eq("user_id", user.id);

  const rsvpedEventIds = new Set(rsvps?.map((r) => r.event_id) || []);

  // Get RSVP counts for each event
  const { data: rsvpCounts } = await supabase
    .from("event_rsvps")
    .select("event_id");

  const countMap: Record<string, number> = {};
  rsvpCounts?.forEach((r) => {
    if (r.event_id) {
      countMap[r.event_id] = (countMap[r.event_id] || 0) + 1;
    }
  });

  return events.map((event) => ({
    ...event,
    user_has_rsvped: rsvpedEventIds.has(event.id),
    rsvp_count: countMap[event.id] || 0,
  }));
}

export async function getUserRsvps(): Promise<EventRsvp[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("event_rsvps")
    .select("*, event:events(*)")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching RSVPs:", error);
    return [];
  }

  return data || [];
}

export async function getMaintenanceTickets(): Promise<MaintenanceTicket[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("maintenance_tickets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tickets:", error);
    return [];
  }

  return data || [];
}

export async function getDashboardData(): Promise<DashboardData> {
  const profile = await getCurrentProfile();

  let property: Property | null = null;
  let upcomingEvent: Event | null = null;
  let openTicketsCount = 0;
  let latestTicket: MaintenanceTicket | null = null;

  if (profile?.property_id) {
    property = await getProperty(profile.property_id);
  }

  // Get user's RSVPed events first
  const rsvps = await getUserRsvps();
  const rsvpedEvents = rsvps
    .filter((r) => r.event && new Date(r.event.starts_at) > new Date())
    .map((r) => r.event!)
    .sort(
      (a, b) =>
        new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
    );

  let isRsvpedEvent = false;
  if (rsvpedEvents.length > 0) {
    upcomingEvent = rsvpedEvents[0];
    isRsvpedEvent = true;
  } else {
    // Fall back to next available event
    const events = await getEvents(profile?.property_id || undefined);
    if (events.length > 0) {
      upcomingEvent = events[0];
    }
  }

  // Get maintenance tickets
  const tickets = await getMaintenanceTickets();
  openTicketsCount = tickets.filter(
    (t) => t.status === "open" || t.status === "in_progress",
  ).length;
  latestTicket = tickets.length > 0 ? tickets[0] : null;

  return {
    profile,
    property,
    upcomingEvent,
    isRsvpedEvent,
    openTicketsCount,
    latestTicket,
  };
}
