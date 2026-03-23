import { useState, useCallback, useEffect } from "react";
import { IMessage } from "react-native-gifted-chat";
import { useQueryClient } from "@tanstack/react-query";
import { buildConciergeContext } from "../lib/ai/buildContext";
import { sendConciergeMessage, ChatMessage } from "../lib/ai/client";
import type { ConciergeContext } from "../types/chat";

const CONCIERGE_USER = {
  _id: "concierge",
  name: "Concierge AI",
};

const CURRENT_USER = {
  _id: "user",
  name: "You",
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function createWelcomeMessage(): IMessage {
  return {
    _id: "welcome",
    text: "Hi! I'm your Concierge AI. I can help with upcoming events, maintenance requests, and property questions. I can also RSVP you to events or create maintenance tickets - just ask!",
    createdAt: new Date(),
    user: CONCIERGE_USER,
  };
}

export function useAiConcierge() {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<IMessage[]>([
    createWelcomeMessage(),
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<ConciergeContext | null>(null);

  // Load context on mount
  useEffect(() => {
    buildConciergeContext().then(setContext).catch(console.error);
  }, []);

  // Refresh context after actions
  const refreshContext = useCallback(async () => {
    const newContext = await buildConciergeContext();
    setContext(newContext);
  }, []);

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      if (newMessages.length === 0 || isTyping) return;

      const userMessage = newMessages[0];
      const trimmedText = userMessage.text.trim();
      if (!trimmedText) return;

      // Add user message immediately (gifted-chat expects newest first)
      setMessages((prev) => [userMessage, ...prev]);
      setIsTyping(true);

      try {
        // Get fresh context if not loaded
        const currentContext = context || (await buildConciergeContext());
        if (!context) setContext(currentContext);

        // Build chat history from messages (excluding welcome message, in chronological order)
        const history: ChatMessage[] = messages
          .filter((m) => m._id !== "welcome")
          .reverse()
          .map((m) => ({
            role: m.user._id === "user" ? "user" : "assistant",
            content: m.text,
          })) as ChatMessage[];

        // Send to AI with history
        const response = await sendConciergeMessage(
          trimmedText,
          currentContext,
          history,
        );

        // Add assistant response
        const assistantMessage: IMessage = {
          _id: generateId(),
          text: response.reply,
          createdAt: new Date(),
          user: CONCIERGE_USER,
        };
        setMessages((prev) => [assistantMessage, ...prev]);

        // If an action was performed, refresh data
        if (response.action?.success) {
          // Invalidate relevant queries to refresh data across the app
          if (
            response.action.type === "rsvp_to_event" ||
            response.action.type === "cancel_rsvp"
          ) {
            queryClient.invalidateQueries({ queryKey: ["events"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          } else if (response.action.type === "create_maintenance_ticket") {
            queryClient.invalidateQueries({
              queryKey: ["maintenance-tickets"],
            });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          }
          // Refresh context for future messages
          await refreshContext();
        }

        // Log error for debugging but don't show to user since we have a reply
        if (response.error) {
          console.warn("AI Concierge warning:", response.error);
        }
      } catch (error: any) {
        console.error("Failed to send message:", error);
        // Don't show toast - just add a message in the chat
        const errorMessage: IMessage = {
          _id: generateId(),
          text: "Sorry, I couldn't respond right now. Please try again.",
          createdAt: new Date(),
          user: CONCIERGE_USER,
        };
        setMessages((prev) => [errorMessage, ...prev]);
      } finally {
        setIsTyping(false);
      }
    },
    [context, isTyping, queryClient, refreshContext],
  );

  const addSystemMessage = useCallback((content: string) => {
    const systemMessage: IMessage = {
      _id: generateId(),
      text: content,
      createdAt: new Date(),
      user: CONCIERGE_USER,
      system: true,
    };
    setMessages((prev) => [systemMessage, ...prev]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([createWelcomeMessage()]);
  }, []);

  return {
    messages,
    isTyping,
    onSend,
    user: CURRENT_USER,
    addSystemMessage,
    clearMessages,
  };
}
