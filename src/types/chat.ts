export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export interface PropertyContext {
  name: string;
  city: string | null;
  address: string | null;
}

export interface EventContext {
  title: string;
  startsAt: string;
  location: string | null;
  description: string | null;
}

export interface FeatureFlags {
  canRsvpToEvents: boolean;
  canSubmitMaintenanceTickets: boolean;
  hasCommunityChat: boolean;
  hasPayments: boolean;
  hasAmenityBooking: boolean;
}

export interface TicketContext {
  title: string;
  category: string;
  status: string;
  createdAt: string;
}

export interface ConciergeContext {
  property: PropertyContext | null;
  events: EventContext[];
  tickets: TicketContext[];
  features: FeatureFlags;
  maintenanceCategories: string[];
}

export interface ConciergeRequest {
  message: string;
  context: ConciergeContext;
}

export interface ConciergeAction {
  type: "rsvp_to_event" | "cancel_rsvp" | "create_maintenance_ticket";
  success: boolean;
}

export interface ConciergeResponse {
  reply: string;
  error?: string;
  action?: ConciergeAction;
}
