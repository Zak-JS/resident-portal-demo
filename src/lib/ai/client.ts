import { supabase } from "../supabase";
import type { ConciergeContext, ConciergeResponse } from "../../types/chat";

const MAX_MESSAGE_LENGTH = 500;
const FALLBACK_RESPONSE =
  "Sorry, I couldn't answer that right now. I can still help with events, maintenance, and property questions.";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendConciergeMessage(
  message: string,
  context: ConciergeContext,
  history: ChatMessage[] = [],
): Promise<ConciergeResponse> {
  // Validate input
  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    return { reply: "Please enter a message.", error: "empty_message" };
  }

  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    return {
      reply: `Please keep your message under ${MAX_MESSAGE_LENGTH} characters.`,
      error: "message_too_long",
    };
  }

  try {
    // Get current session for auth
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const url = `${SUPABASE_URL}/functions/v1/ai-concierge`;
    const authToken = session?.access_token || SUPABASE_ANON_KEY;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        message: trimmedMessage,
        context,
        history,
      }),
    });

    const data = await response.json();

    if (data.reply) {
      return {
        reply: data.reply,
        action: data.action,
      };
    }

    return { reply: FALLBACK_RESPONSE, error: data.error || "no_reply" };
  } catch (err: any) {
    console.error("AI Concierge request failed:", err);
    return { reply: FALLBACK_RESPONSE, error: "request_failed" };
  }
}
