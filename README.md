# Resident Portal Demo

A cross-platform mobile application for residential property management featuring an AI-powered concierge, event management, maintenance ticketing with real-time notifications, and a polished modern UI.

## Features

- ✅ **AI Concierge** - Natural language chat that can perform actions (RSVP, create tickets)
- ✅ **Dashboard** - Personalized home with property info, notifications, and quick stats
- ✅ **Events** - Community events with RSVP/cancel functionality
- ✅ **Maintenance** - Ticket creation with timeline and staff response notifications
- ✅ **Notifications** - Real-time badge updates when staff responds to tickets
- ✅ **Cross-platform** - iOS, Android, and Web from single codebase

## Demo Credentials

```
Email: guy@demo.com
Password: Demo1234!
```

## Tech Stack

| Layer          | Technology                                    |
| -------------- | --------------------------------------------- |
| **Frontend**   | React Native + Expo (SDK 55)                  |
| **Routing**    | Expo Router (file-based)                      |
| **Styling**    | NativeWind (Tailwind CSS)                     |
| **State**      | TanStack Query                                |
| **Backend**    | Supabase (PostgreSQL + Auth + Edge Functions) |
| **AI**         | OpenAI GPT-4o-mini with function calling      |
| **Validation** | Zod (runtime) + TypeScript (compile-time)     |
| **Types**      | Auto-generated from database schema           |

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create `.env` in the project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the App

```bash
npm start
```

- Press `w` for Web browser
- Press `i` for iOS Simulator
- Press `a` for Android Emulator

> **Note:** Expo SDK 55 requires a development build for physical devices. Use `npx expo run:ios` or `npx expo run:android`.

## Project Structure

```
src/
├── app/                      # Expo Router screens
│   ├── _layout.tsx           # Root layout with providers
│   ├── dashboard.tsx         # Main dashboard
│   ├── events.tsx            # Events list
│   ├── maintenance.tsx       # Maintenance tickets
│   ├── concierge.tsx         # AI chat interface
│   └── ticket/[id].tsx       # Ticket detail with timeline
├── components/
│   ├── ui/                   # Reusable UI (Button, StatusBadge, Toast)
│   ├── events/               # EventCard
│   └── maintenance/          # TicketCard
├── contexts/
│   └── NotificationContext.tsx  # Notification state
├── hooks/
│   ├── useSession.ts         # Auth session
│   ├── useQueries.ts         # TanStack Query hooks
│   └── useAiConcierge.ts     # AI chat logic
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── auth.ts               # Auth helpers
│   ├── queries.ts            # Data fetching
│   ├── mutations.ts          # Data mutations + mock responses
│   ├── validators.ts         # Zod schemas
│   └── ai/                   # AI client and context builder
└── types/
    ├── database.ts           # Auto-generated from Supabase
    └── index.ts              # Extended types
```

## Database Schema

```
profiles ─────┬───── properties
              │
events ───────┤
              │
event_rsvps ──┤
              │
maintenance_tickets ──── ticket_responses
```

All tables have Row Level Security (RLS) policies ensuring users only access their own data.

## Key Features Explained

### AI Concierge

The AI can perform real actions, not just chat:

- "Sign me up for the pool party" → RSVPs to the event
- "My sink is leaking" → Creates a maintenance ticket
- Context-aware: knows user's property, events, and tickets

### Notification System

1. User creates a maintenance ticket
2. After 15 seconds, a mock staff response is added
3. Notification badge appears on the bell icon
4. Tapping navigates to ticket detail with timeline
5. Viewing marks notifications as read

### Type Safety

- **Compile-time**: TypeScript strict mode
- **Runtime**: Zod validation on forms
- **Database**: Auto-generated types via `npm run gen:types`

## Scripts

```bash
npm start          # Start Expo dev server
npm run web        # Start web version
npm run gen:types  # Regenerate Supabase types
```

## Documentation

- [TECH_STACK.md](./TECH_STACK.md) - Detailed architecture decisions
