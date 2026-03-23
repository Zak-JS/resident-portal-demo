import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDashboardData,
  getEvents,
  getMaintenanceTickets,
} from "../lib/queries";
import {
  rsvpToEvent,
  cancelRsvp,
  createMaintenanceTicket,
} from "../lib/mutations";
import type { MaintenanceTicketFormData } from "../lib/validators";
import { showSuccessToast, showErrorToast } from "../components/ui/Toast";

// Query keys for cache management
export const queryKeys = {
  dashboard: ["dashboard"] as const,
  events: ["events"] as const,
  maintenanceTickets: ["maintenanceTickets"] as const,
};

// Dashboard
export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboardData,
    staleTime: 0, // Always refetch on mount
    gcTime: 0, // Don't cache between sessions
    refetchOnMount: "always", // Force refetch every time component mounts
  });
}

// Events
export function useEvents() {
  return useQuery({
    queryKey: queryKeys.events,
    queryFn: () => getEvents(),
  });
}

export function useRsvpToEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => rsvpToEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      showSuccessToast("You're in!", "Successfully RSVPed to the event");
    },
    onError: () => {
      showErrorToast("RSVP Failed", "Please try again");
    },
  });
}

export function useCancelRsvp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => cancelRsvp(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      showSuccessToast("RSVP Cancelled", "You've been removed from the event");
    },
    onError: () => {
      showErrorToast("Cancellation Failed", "Please try again");
    },
  });
}

// Maintenance Tickets
export function useMaintenanceTickets() {
  return useQuery({
    queryKey: queryKeys.maintenanceTickets,
    queryFn: getMaintenanceTickets,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useCreateMaintenanceTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MaintenanceTicketFormData) =>
      createMaintenanceTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceTickets });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      showSuccessToast("Ticket Submitted", "We'll get back to you soon");
    },
    onError: () => {
      showErrorToast("Submission Failed", "Please try again");
    },
  });
}
