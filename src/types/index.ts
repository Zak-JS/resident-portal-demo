import type { Tables } from "./database";

// Re-export database types with proper naming
// These types are auto-generated from Supabase schema via `npm run gen:types`
export type Property = Tables<"properties">;
export type Profile = Tables<"profiles"> & {
  property?: Tables<"properties"> | null;
};
export type Event = Tables<"events"> & {
  rsvp_count?: number;
  user_has_rsvped?: boolean;
};
export type EventRsvp = Tables<"event_rsvps"> & {
  event?: Tables<"events"> | null;
};
export type MaintenanceTicket = Tables<"maintenance_tickets"> & {
  responses?: TicketResponse[];
};

export interface TicketResponse {
  id: string;
  ticket_id: string;
  message: string;
  is_staff: boolean;
  is_read: boolean;
  created_at: string;
}

export interface DashboardData {
  profile: Tables<"profiles"> | null;
  property: Tables<"properties"> | null;
  upcomingEvent: Tables<"events"> | null;
  isRsvpedEvent: boolean;
  openTicketsCount: number;
  latestTicket: Tables<"maintenance_tickets"> | null;
}

export type TicketCategory =
  | "Plumbing"
  | "Electrical"
  | "Heating"
  | "Cleaning"
  | "Other";

export const TICKET_CATEGORIES: TicketCategory[] = [
  "Plumbing",
  "Electrical",
  "Heating",
  "Cleaning",
  "Other",
];
