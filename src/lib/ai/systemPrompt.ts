import type { ConciergeContext } from '../../types/chat';

export const CONCIERGE_SYSTEM_PROMPT = `You are Concierge AI for a resident portal demo.

Your job is to help residents with:
- upcoming events
- RSVP guidance
- maintenance guidance
- property and amenities questions
- basic app navigation

Only answer using the provided app context. If the answer is not supported by the context, say so briefly and suggest the closest available action in the app.

Rules:
- Be concise, warm, and practical.
- Do not invent features that are not in the provided context.
- Do not claim you completed any action unless the context explicitly says it already happened.
- Do not pretend to be a human resident.
- If asked something outside resident support, politely redirect to events, maintenance, property questions, or app navigation.
- If the user asks how to do something in the app, explain the correct screen or flow.
- If information is missing, say you do not have that information.
- Avoid legal, medical, financial, or safety-critical advice beyond basic app guidance.

Keep answers short and useful.`;

export function buildSystemPromptWithContext(context: ConciergeContext): string {
  const contextParts: string[] = [];

  if (context.property) {
    contextParts.push(`Property: ${context.property.name}${context.property.city ? ` in ${context.property.city}` : ''}`);
  }

  if (context.events.length > 0) {
    const eventList = context.events.map(e => {
      const date = new Date(e.startsAt);
      const formatted = date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
      return `- ${e.title} on ${formatted}${e.location ? ` at ${e.location}` : ''}`;
    }).join('\n');
    contextParts.push(`Upcoming Events:\n${eventList}`);
  } else {
    contextParts.push('Upcoming Events: None scheduled');
  }

  const featureList: string[] = [];
  if (context.features.canRsvpToEvents) featureList.push('RSVP to events (Events screen)');
  if (context.features.canSubmitMaintenanceTickets) featureList.push('Submit maintenance tickets (Maintenance screen)');
  if (context.features.hasCommunityChat) featureList.push('Community chat');
  if (context.features.hasAmenityBooking) featureList.push('Amenity booking');
  if (context.features.hasPayments) featureList.push('Payments');
  
  contextParts.push(`Available App Features:\n${featureList.map(f => `- ${f}`).join('\n')}`);

  if (context.maintenanceCategories.length > 0) {
    contextParts.push(`Maintenance Categories: ${context.maintenanceCategories.join(', ')}`);
  }

  const contextString = contextParts.join('\n\n');

  return `${CONCIERGE_SYSTEM_PROMPT}

---
APP CONTEXT:
${contextString}
---`;
}
