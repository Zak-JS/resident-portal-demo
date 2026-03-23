# Resident Portal Demo - Tech Stack & Architecture

## Overview

A modern, cross-platform mobile application for residential property management, featuring AI-powered assistance, real-time notifications, and a polished user experience.

---

## Type Safety & Validation

### TypeScript (Strict Mode)

**Why chosen:**

- **Compile-time errors**: Catch bugs before runtime
- **IDE support**: Autocomplete, refactoring, and inline documentation
- **Self-documenting**: Types serve as living documentation
- **Refactoring confidence**: Change code safely with type checking

**Implementation:**

```typescript
// Strict null checks - forces handling of undefined/null
const firstName = data?.profile?.full_name?.split(" ")[0] || "";

// Generic types for reusable components
function useQuery<T>(queryFn: () => Promise<T>): QueryResult<T>;

// Discriminated unions for state
type Status = "open" | "in_progress" | "resolved" | "closed";
```

### Supabase Type Generation

**Why chosen:**

- **Database-to-TypeScript**: Auto-generated types from schema
- **Single source of truth**: Types always match database
- **No manual sync**: Run `npm run gen:types` after schema changes
- **Row/Insert/Update variants**: Different types for different operations

**How it works:**

```bash
npm run gen:types
# Runs: npx supabase gen types typescript --linked > src/types/database.ts
```

**What gets generated (444 lines of type definitions):**

```typescript
// Auto-generated - DO NOT EDIT
export type Database = {
  public: {
    Tables: {
      maintenance_tickets: {
        Row: {
          // What you SELECT
          id: string;
          title: string;
          category: string;
          description: string;
          status: string;
          user_id: string | null;
          property_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          // What you INSERT (optional fields have ?)
          id?: string; // Auto-generated UUID
          title: string; // Required
          category: string;
          description: string;
          status?: string; // Has default value
          user_id?: string | null;
          property_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          // What you UPDATE (all optional)
          id?: string;
          title?: string;
          category?: string;
          // ... all fields optional
        };
        Relationships: [
          // Foreign key metadata
          {
            foreignKeyName: "maintenance_tickets_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      // ... events, profiles, properties, ticket_responses, etc.
    };
  };
};
```

**Type-safe queries:**

```typescript
// TypeScript knows exactly what fields exist
const { data } = await supabase
  .from("maintenance_tickets") // Autocomplete table names
  .select("id, title, status") // Autocomplete column names
  .eq("user_id", userId); // Type-checked filter

// data is typed as: { id: string; title: string; status: string }[]
```

**How we use them in the app:**

```typescript
// src/types/index.ts - Re-export with extensions
import type { Tables } from "./database";

export type Property = Tables<"properties">;
export type MaintenanceTicket = Tables<"maintenance_tickets"> & {
  responses?: TicketResponse[]; // Extended with relationships
};

// Extended types for computed fields
export type Event = Tables<"events"> & {
  rsvp_count?: number;
  user_has_rsvped?: boolean;
};
```

**Benefits:**

- Schema change → regenerate types → TypeScript errors show all affected code
- IDE autocomplete for table names, column names, and filter values
- Insert vs Update vs Select have appropriate required/optional fields
- Foreign key relationships documented in types

### Zod (Runtime Validation)

**Why chosen:**

- **Runtime safety**: Validates data at boundaries (forms, API responses)
- **TypeScript integration**: Infers types from schemas automatically
- **Composable**: Build complex schemas from simple ones
- **Error messages**: User-friendly validation errors

**Implementation:**

```typescript
// Form validation schema
export const maintenanceTicketSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  category: z.enum(["Plumbing", "Electrical", "Heating", "Cleaning", "Other"]),
  description: z
    .string()
    .min(10, "Please provide more details")
    .max(1000, "Description is too long"),
});

// Type inference - no duplication!
export type MaintenanceTicketFormData = z.infer<typeof maintenanceTicketSchema>;
```

### Type Safety Layers

```
┌─────────────────────────────────────────────────────────┐
│  UI Components                                          │
│  - Props typed with interfaces                          │
│  - Event handlers typed                                 │
├─────────────────────────────────────────────────────────┤
│  Form Validation (Zod)                                  │
│  - Runtime validation before submission                 │
│  - Type inference for form data                         │
├─────────────────────────────────────────────────────────┤
│  API Layer (TanStack Query)                             │
│  - Typed query functions                                │
│  - Typed mutation payloads and responses                │
├─────────────────────────────────────────────────────────┤
│  Supabase Client                                        │
│  - Auto-generated types from schema                     │
│  - Type-safe queries with .select()                     │
├─────────────────────────────────────────────────────────┤
│  Database (PostgreSQL)                                  │
│  - Schema constraints (NOT NULL, CHECK, FK)             │
│  - RLS policies for access control                      │
└─────────────────────────────────────────────────────────┘
```

### Key Type Safety Patterns Used

| Pattern              | Example                          | Benefit                      |
| -------------------- | -------------------------------- | ---------------------------- |
| Strict null checks   | `profile?.full_name \|\| "User"` | No null reference errors     |
| Discriminated unions | `status: "open" \| "closed"`     | Exhaustive switch statements |
| Generic hooks        | `useQuery<DashboardData>()`      | Type-safe data fetching      |
| Zod inference        | `z.infer<typeof schema>`         | Single source of truth       |
| Database types       | `Tables<"events">`               | Schema-driven types          |

### Validation at Every Layer

1. **Client-side (Zod)**: Immediate feedback, prevents bad submissions
2. **API (Edge Functions)**: Validates incoming requests
3. **Database (Constraints)**: Final safety net, enforces data integrity

---

## Frontend

### React Native + Expo (SDK 55)

**Why chosen:**

- **Cross-platform**: Single codebase for iOS, Android, and Web
- **Expo**: Managed workflow eliminates native build complexity, provides OTA updates, and includes essential native modules out-of-the-box
- **Developer experience**: Fast refresh, excellent debugging tools, and streamlined deployment via EAS

### Expo Router (File-based routing)

**Why chosen:**

- **Familiar pattern**: Similar to Next.js file-based routing, reducing learning curve
- **Type-safe navigation**: Auto-generated TypeScript types for routes
- **Deep linking**: Built-in support for universal links
- **Nested layouts**: Clean separation of concerns with shared layouts

### NativeWind (Tailwind CSS for React Native)

**Why chosen:**

- **Consistency**: Same utility classes as web Tailwind, enabling rapid UI development
- **Design system**: Easy to maintain consistent spacing, colors, and typography
- **Performance**: Styles compiled at build time, no runtime overhead
- **Familiarity**: Widely adopted, easy for any developer to understand

### TanStack Query (React Query)

**Why chosen:**

- **Server state management**: Handles caching, background refetching, and stale data automatically
- **Optimistic updates**: Instant UI feedback with automatic rollback on errors
- **Cache invalidation**: Smart invalidation ensures data consistency across screens
- **DevTools**: Excellent debugging capabilities

---

## Backend

### Supabase

**Why chosen:**

- **All-in-one platform**: Database, Auth, Storage, Edge Functions, and Realtime in one service
- **PostgreSQL**: Full SQL power with RLS (Row Level Security) for data protection
- **Open source**: No vendor lock-in, can self-host if needed
- **Real-time subscriptions**: Built-in support for live data updates
- **Generous free tier**: Perfect for demos and MVPs

### Supabase Auth

**Why chosen:**

- **Multiple providers**: Email/password, OAuth (Google, Apple, etc.), magic links
- **JWT-based**: Stateless authentication that scales
- **Row Level Security integration**: Auth state automatically available in RLS policies
- **Session management**: Automatic token refresh and secure storage

### Supabase Edge Functions (Deno)

**Why chosen:**

- **Serverless**: No infrastructure to manage, scales automatically
- **Low latency**: Deployed globally at the edge
- **TypeScript native**: First-class TypeScript support
- **Secure**: Environment variables for secrets, isolated execution

---

## AI Integration

### OpenAI GPT-4o-mini

**Why chosen:**

- **Cost-effective**: Significantly cheaper than GPT-4 while maintaining quality
- **Fast**: Low latency responses suitable for chat interfaces
- **Function calling**: Native support for structured tool use (RSVP, create tickets)
- **Context window**: Large enough for conversation history + app context

### AI Concierge Architecture

```
User Message → Edge Function → Build Context → OpenAI API → Parse Response → Execute Actions
                    ↓
              [User's property, events, tickets injected as context]
```

**Key features:**

- **Context-aware**: AI knows user's property, upcoming events, and ticket history
- **Action-capable**: Can RSVP to events, create maintenance tickets via function calling
- **Graceful degradation**: Handles auth errors without breaking the experience

---

## Database Schema

### Core Tables

- **profiles**: User information linked to auth.users
- **properties**: Residential properties with addresses
- **events**: Community events with RSVP tracking
- **event_rsvps**: Many-to-many relationship for RSVPs
- **maintenance_tickets**: Support tickets with status tracking
- **ticket_responses**: Timeline of responses on tickets

### Row Level Security (RLS)

Every table has RLS policies ensuring:

- Users can only read their own data
- Users can only modify their own records
- Service role bypasses RLS for admin operations

---

## State Management

### Local State

- **React useState/useReducer**: Component-level state
- **React Context**: App-wide state (notifications, auth session)

### Server State

- **TanStack Query**: All API data with automatic caching
- **Query invalidation**: Actions trigger refetches of related data

### Why no Redux/Zustand?

- **Simplicity**: TanStack Query handles 90% of state needs
- **Less boilerplate**: No actions, reducers, or selectors to maintain
- **Server-first**: Data lives on the server, not duplicated in client state

---

## Notifications System

### Architecture

```
Ticket Created → 15s delay → Mock Staff Response → Poll every 5s → Badge Update
                                    ↓
                            ticket_responses table
```

### Implementation

- **Polling**: Simple and reliable, checks every 5 seconds
- **Context-based**: NotificationProvider wraps app, provides unread count
- **Mark as read**: Viewing a ticket marks responses as read

### Why polling over WebSockets?

- **Simplicity**: No connection management or reconnection logic
- **Reliability**: Works across all network conditions
- **Sufficient for demo**: 5-second delay is acceptable for notifications

---

## UI/UX Decisions

### Design System

- **Primary color**: Pink (#E91E63) - Modern, distinctive, accessible
- **Typography**: Inter font family - Clean, highly legible
- **Shadows**: Subtle elevation for depth without heaviness
- **Rounded corners**: 2xl (16px) for cards, full for buttons

### Toast Notifications

- **react-native-toast-message**: Non-intrusive success/error feedback
- **Custom styling**: Matches app design system
- **Positioned at top**: Doesn't interfere with bottom navigation

### Quick Actions (AI Concierge)

- **Always visible**: Horizontal scroll of action chips above input
- **One-tap actions**: Reduces friction for common tasks

---

## Security Considerations

### Authentication

- **Secure token storage**: expo-secure-store for JWT tokens
- **Automatic refresh**: Supabase client handles token refresh
- **Session validation**: Auth state checked on app launch

### API Security

- **RLS policies**: Database-level access control
- **Service role separation**: Edge functions use service role only when needed
- **No secrets in client**: All sensitive keys in environment variables

### Data Protection

- **User isolation**: RLS ensures users only see their own data
- **Input validation**: Zod schemas validate all form inputs

---

## Testing Strategy

### Manual Testing

- **Web preview**: Rapid iteration during development
- **Expo Go / Dev builds**: Native testing on devices

### Future Improvements

- **Jest + React Native Testing Library**: Unit and integration tests
- **Detox / Maestro**: E2E testing on simulators
- **Playwright**: Web-specific E2E tests

---

## Deployment

### Mobile

- **EAS Build**: Managed build service for iOS and Android
- **OTA Updates**: Push updates without app store review

### Backend

- **Supabase Cloud**: Managed PostgreSQL and Edge Functions
- **Automatic scaling**: Handles traffic spikes automatically

---

## Trade-offs & Decisions

| Decision                    | Trade-off             | Reasoning                                     |
| --------------------------- | --------------------- | --------------------------------------------- |
| Expo managed workflow       | Less native control   | Faster development, easier maintenance        |
| Supabase over Firebase      | Smaller ecosystem     | PostgreSQL power, better pricing, open source |
| Polling over WebSockets     | Higher latency        | Simpler implementation, sufficient for demo   |
| No state management library | Less structure        | TanStack Query covers most needs              |
| GPT-4o-mini over GPT-4      | Slightly less capable | 10x cheaper, fast enough for chat             |

---

## Scalability Considerations

### Current Architecture Supports

- **Thousands of users**: Supabase scales horizontally
- **Multiple properties**: Schema supports multi-property management
- **High message volume**: Edge functions auto-scale

### Future Enhancements

- **Real-time subscriptions**: Replace polling with Supabase Realtime
- **Push notifications**: Expo Push + background tasks
- **Offline support**: TanStack Query persistence + sync
- **Multi-tenant**: Property management company dashboard

---

## Key Talking Points for Interview

1. **Full-stack ownership**: Built entire app from database schema to polished UI
2. **AI integration**: Practical use of LLMs with function calling for real actions
3. **Modern patterns**: File-based routing, server state management, utility-first CSS
4. **Security-first**: RLS policies, secure token storage, input validation
5. **UX focus**: Toast notifications, optimistic updates, loading states
6. **Cross-platform**: Single codebase for iOS, Android, and Web
