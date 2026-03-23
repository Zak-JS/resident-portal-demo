import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { TicketResponse } from "../types";

interface Notification {
  id: string;
  ticketId: string;
  ticketTitle: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refreshNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get all unread staff responses on user's tickets
    const { data: responses, error } = await supabase
      .from("ticket_responses")
      .select(`
        id,
        ticket_id,
        message,
        is_read,
        created_at,
        maintenance_tickets!inner(id, title, user_id)
      `)
      .eq("is_staff", true)
      .eq("maintenance_tickets.user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      return;
    }

    const notifs: Notification[] = (responses || []).map((r: any) => ({
      id: r.id,
      ticketId: r.ticket_id,
      ticketTitle: r.maintenance_tickets?.title || "Maintenance Ticket",
      message: r.message,
      isRead: r.is_read,
      createdAt: r.created_at,
    }));

    setNotifications(notifs);
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    await supabase
      .from("ticket_responses")
      .update({ is_read: true })
      .eq("id", notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length === 0) return;

    await supabase
      .from("ticket_responses")
      .update({ is_read: true })
      .in("id", unreadIds);

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, [notifications]);

  // Poll for new notifications every 5 seconds
  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 5000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
