import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SYSTEM_PROMPT = `You are Concierge AI for a resident portal demo.

Your job is to help residents with:
- upcoming events and RSVPing to them
- maintenance ticket creation and updates
- property and amenities questions
- basic app navigation

You have the ability to perform actions on behalf of the user:
- RSVP to events or cancel RSVPs
- Create maintenance tickets

When the user asks you to RSVP to an event, cancel an RSVP, or create a maintenance ticket, use the appropriate function to do so.

Rules:
- Be concise, warm, and practical.
- When performing actions, confirm what you did.
- If an event name is ambiguous, ask for clarification.
- For maintenance tickets, ask for the category if not provided. Valid categories are: Plumbing, Electrical, Heating, Cleaning, Other.
- Do not invent features that are not in the provided context.
- Do not pretend to be a human resident.
- If asked something outside resident support, politely redirect to events, maintenance, property questions, or app navigation.

Keep answers short and useful.`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "rsvp_to_event",
      description:
        "RSVP the user to an event. Use this when the user wants to attend or sign up for an event.",
      parameters: {
        type: "object",
        properties: {
          event_title: {
            type: "string",
            description: "The title of the event to RSVP to",
          },
        },
        required: ["event_title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cancel_rsvp",
      description:
        "Cancel the user's RSVP to an event. Use this when the user wants to cancel their attendance.",
      parameters: {
        type: "object",
        properties: {
          event_title: {
            type: "string",
            description: "The title of the event to cancel RSVP for",
          },
        },
        required: ["event_title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_maintenance_ticket",
      description:
        "Create a new maintenance ticket for the user. Use this when the user reports an issue or requests maintenance.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "A brief title for the maintenance issue",
          },
          category: {
            type: "string",
            enum: ["Plumbing", "Electrical", "Heating", "Cleaning", "Other"],
            description: "The category of the maintenance issue",
          },
          description: {
            type: "string",
            description: "A detailed description of the issue",
          },
        },
        required: ["title", "category", "description"],
      },
    },
  },
];

interface ConciergeContext {
  property: {
    name: string;
    city: string | null;
    address: string | null;
  } | null;
  events: Array<{
    title: string;
    startsAt: string;
    location: string | null;
    description: string | null;
  }>;
  tickets: Array<{
    title: string;
    category: string;
    status: string;
    createdAt: string;
  }>;
  features: {
    canRsvpToEvents: boolean;
    canSubmitMaintenanceTickets: boolean;
    hasCommunityChat: boolean;
    hasPayments: boolean;
    hasAmenityBooking: boolean;
  };
  maintenanceCategories: string[];
}

function buildContextString(context: ConciergeContext): string {
  const parts: string[] = [];

  if (context.property) {
    parts.push(
      `Property: ${context.property.name}${context.property.city ? ` in ${context.property.city}` : ""}`,
    );
  }

  if (context.events.length > 0) {
    const eventList = context.events
      .map((e) => {
        const date = new Date(e.startsAt);
        const formatted = date.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
        return `- ${e.title} on ${formatted}${e.location ? ` at ${e.location}` : ""}`;
      })
      .join("\n");
    parts.push(`Upcoming Events:\n${eventList}`);
  } else {
    parts.push("Upcoming Events: None scheduled");
  }

  const featureList: string[] = [];
  if (context.features.canRsvpToEvents)
    featureList.push("RSVP to events (Events screen)");
  if (context.features.canSubmitMaintenanceTickets)
    featureList.push("Submit maintenance tickets (Maintenance screen)");
  if (context.features.hasCommunityChat) featureList.push("Community chat");
  if (context.features.hasAmenityBooking) featureList.push("Amenity booking");
  if (context.features.hasPayments) featureList.push("Payments");

  parts.push(
    `Available App Features:\n${featureList.map((f) => `- ${f}`).join("\n")}`,
  );

  if (context.maintenanceCategories.length > 0) {
    parts.push(
      `Maintenance Categories: ${context.maintenanceCategories.join(", ")}`,
    );
  }

  if (context.tickets && context.tickets.length > 0) {
    const ticketList = context.tickets
      .map((t) => {
        return `- "${t.title}" (${t.category}) - Status: ${t.status}`;
      })
      .join("\n");
    parts.push(`Your Maintenance Tickets:\n${ticketList}`);
  } else {
    parts.push("Your Maintenance Tickets: None");
  }

  return parts.join("\n\n");
}

// Action handlers
async function handleRsvpToEvent(
  userId: string,
  eventTitle: string,
  context: ConciergeContext,
): Promise<{ success: boolean; message: string }> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Find the event by title (case-insensitive partial match)
  const matchingEvent = context.events.find(
    (e) =>
      e.title.toLowerCase().includes(eventTitle.toLowerCase()) ||
      eventTitle.toLowerCase().includes(e.title.toLowerCase()),
  );

  if (!matchingEvent) {
    return {
      success: false,
      message: `Could not find an event matching "${eventTitle}". Available events: ${context.events.map((e) => e.title).join(", ")}`,
    };
  }

  // Get the event ID from the database
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, title")
    .ilike("title", `%${matchingEvent.title}%`)
    .single();

  if (eventError || !event) {
    return {
      success: false,
      message: `Could not find the event in the database.`,
    };
  }

  // Check if already RSVPed
  const { data: existingRsvp } = await supabase
    .from("event_rsvps")
    .select("id")
    .eq("user_id", userId)
    .eq("event_id", event.id)
    .single();

  if (existingRsvp) {
    return {
      success: false,
      message: `You're already RSVPed to "${event.title}".`,
    };
  }

  // Create RSVP
  const { error: rsvpError } = await supabase
    .from("event_rsvps")
    .insert({ user_id: userId, event_id: event.id });

  if (rsvpError) {
    console.error("RSVP error:", rsvpError);
    return { success: false, message: `Failed to RSVP: ${rsvpError.message}` };
  }

  return { success: true, message: `Successfully RSVPed to "${event.title}"!` };
}

async function handleCancelRsvp(
  userId: string,
  eventTitle: string,
  context: ConciergeContext,
): Promise<{ success: boolean; message: string }> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Find the event by title
  const matchingEvent = context.events.find(
    (e) =>
      e.title.toLowerCase().includes(eventTitle.toLowerCase()) ||
      eventTitle.toLowerCase().includes(e.title.toLowerCase()),
  );

  if (!matchingEvent) {
    return {
      success: false,
      message: `Could not find an event matching "${eventTitle}".`,
    };
  }

  // Get the event ID
  const { data: event } = await supabase
    .from("events")
    .select("id, title")
    .ilike("title", `%${matchingEvent.title}%`)
    .single();

  if (!event) {
    return {
      success: false,
      message: `Could not find the event in the database.`,
    };
  }

  // Delete RSVP
  const { error } = await supabase
    .from("event_rsvps")
    .delete()
    .eq("user_id", userId)
    .eq("event_id", event.id);

  if (error) {
    return {
      success: false,
      message: `Failed to cancel RSVP: ${error.message}`,
    };
  }

  return {
    success: true,
    message: `Cancelled your RSVP for "${event.title}".`,
  };
}

async function handleCreateTicket(
  userId: string,
  title: string,
  category: string,
  description: string,
): Promise<{ success: boolean; message: string }> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Get user's property
  const { data: profile } = await supabase
    .from("profiles")
    .select("property_id")
    .eq("id", userId)
    .single();

  // Create ticket
  const { data: ticket, error } = await supabase
    .from("maintenance_tickets")
    .insert({
      user_id: userId,
      property_id: profile?.property_id,
      title,
      category,
      description,
      status: "open",
    })
    .select()
    .single();

  if (error) {
    console.error("Ticket creation error:", error);
    return {
      success: false,
      message: `Failed to create ticket: ${error.message}`,
    };
  }

  return {
    success: true,
    message: `Created maintenance ticket: "${title}" (${category}). A team member will review it soon.`,
  };
}

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not configured");
      return new Response(
        JSON.stringify({
          reply:
            "AI service is being configured. Please try again in a moment.",
        }),
        { status: 200, headers: CORS_HEADERS },
      );
    }

    // Get user ID from auth header
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const token = authHeader.replace("Bearer ", "");
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(token);
        if (error) {
          console.warn("Auth error (continuing without user):", error.message);
        }
        userId = user?.id || null;
      } catch (authErr) {
        console.warn("Failed to get user from token:", authErr);
      }
    }

    const body = await req.json();
    const { message, context, history } = body as {
      message: string;
      context: ConciergeContext;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    };

    console.log(
      "Received message:",
      message,
      "User:",
      userId,
      "History length:",
      history?.length || 0,
    );

    // Validate input
    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ reply: "Please enter a message." }),
        { status: 200, headers: CORS_HEADERS },
      );
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return new Response(
        JSON.stringify({ reply: "Please enter a message." }),
        { status: 200, headers: CORS_HEADERS },
      );
    }

    if (trimmedMessage.length > 500) {
      return new Response(
        JSON.stringify({
          reply: "Please keep your message under 500 characters.",
        }),
        { status: 200, headers: CORS_HEADERS },
      );
    }

    // Build the full system prompt with context
    const contextString = buildContextString(context);
    const fullSystemPrompt = `${SYSTEM_PROMPT}\n\n---\nAPP CONTEXT:\n${contextString}\n---`;

    // Build messages array with history
    const chatMessages: Array<{ role: string; content: string }> = [
      { role: "system", content: fullSystemPrompt },
    ];

    // Add conversation history (limit to last 10 messages to avoid token limits)
    if (history && history.length > 0) {
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        chatMessages.push({ role: msg.role, content: msg.content });
      }
    }

    // Add current user message
    chatMessages.push({ role: "user", content: trimmedMessage });

    // Call OpenAI API with tools
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: chatMessages,
          tools: TOOLS,
          tool_choice: "auto",
          max_tokens: 500,
          temperature: 0.7,
        }),
      },
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", openaiResponse.status, errorText);
      return new Response(
        JSON.stringify({
          reply: `AI service temporarily unavailable.`,
          debug: errorText,
        }),
        { status: 200, headers: CORS_HEADERS },
      );
    }

    const data = await openaiResponse.json();
    const choice = data.choices?.[0];
    const responseMessage = choice?.message;

    // Check if the model wants to call a function
    if (responseMessage?.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCall = responseMessage.tool_calls[0];
      const functionName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      console.log("Tool call:", functionName, args);

      let actionResult: { success: boolean; message: string };

      if (!userId) {
        actionResult = {
          success: false,
          message: "You need to be logged in to perform this action.",
        };
      } else {
        switch (functionName) {
          case "rsvp_to_event":
            actionResult = await handleRsvpToEvent(
              userId,
              args.event_title,
              context,
            );
            break;
          case "cancel_rsvp":
            actionResult = await handleCancelRsvp(
              userId,
              args.event_title,
              context,
            );
            break;
          case "create_maintenance_ticket":
            actionResult = await handleCreateTicket(
              userId,
              args.title,
              args.category,
              args.description,
            );
            break;
          default:
            actionResult = { success: false, message: "Unknown action." };
        }
      }

      // Get a natural language response from the AI about the action result
      const followUpResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful concierge. Respond naturally to confirm the action result to the user. Be brief and friendly.",
              },
              {
                role: "user",
                content: `Action: ${functionName}\nResult: ${actionResult.message}\n\nPlease confirm this to the user in a friendly way.`,
              },
            ],
            max_tokens: 150,
            temperature: 0.7,
          }),
        },
      );

      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json();
        const reply =
          followUpData.choices?.[0]?.message?.content?.trim() ||
          actionResult.message;
        return new Response(
          JSON.stringify({
            reply,
            action: { type: functionName, success: actionResult.success },
          }),
          { headers: CORS_HEADERS },
        );
      }

      return new Response(
        JSON.stringify({
          reply: actionResult.message,
          action: { type: functionName, success: actionResult.success },
        }),
        { headers: CORS_HEADERS },
      );
    }

    // No tool call, just return the text response
    const reply = responseMessage?.content?.trim();

    if (!reply) {
      return new Response(
        JSON.stringify({
          reply: "I couldn't generate a response. Please try again.",
        }),
        { status: 200, headers: CORS_HEADERS },
      );
    }

    return new Response(JSON.stringify({ reply }), { headers: CORS_HEADERS });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        reply: "Sorry, something went wrong. Please try again.",
      }),
      { status: 200, headers: CORS_HEADERS },
    );
  }
});
