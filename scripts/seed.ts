// Seed script - run with: npx ts-node scripts/seed.ts
// This creates the demo user and seeds the database

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables. Make sure .env file exists.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seed() {
  console.log("🌱 Starting seed...");

  // 1. Create demo user via Auth Admin API
  console.log("Creating demo user...");
  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email: "guy@demo.com",
      password: "Demo1234!",
      email_confirm: true,
      user_metadata: {
        full_name: "Guy Gruper",
      },
    });

  if (authError) {
    console.error("Error creating user:", authError);
    return;
  }

  const userId = authUser.user.id;
  console.log("✅ Created user:", userId);

  // 2. Create property
  console.log("Creating property...");
  const { data: property, error: propError } = await supabase
    .from("properties")
    .insert({
      name: "Vonder Shoreditch",
      city: "London",
      address: "123 Shoreditch High Street, London E1 6JN",
    })
    .select()
    .single();

  if (propError) {
    console.error("Error creating property:", propError);
    return;
  }
  console.log("✅ Created property:", property.id);

  // 3. Create profile
  console.log("Creating profile...");
  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    full_name: "Guy Gruper",
    property_id: property.id,
    unit_label: "Flat 4B",
  });

  if (profileError) {
    console.error("Error creating profile:", profileError);
    return;
  }
  console.log("✅ Created profile");

  // 4. Create events
  console.log("Creating events...");
  const now = new Date();
  const events = [
    {
      property_id: property.id,
      title: "Rooftop Yoga",
      description:
        "Start your morning with a relaxing yoga session on the rooftop terrace.",
      location: "Rooftop Terrace",
      starts_at: new Date(
        now.getTime() + 2 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 2 days from now
      capacity: 15,
    },
    {
      property_id: property.id,
      title: "Community Breakfast",
      description:
        "Join your neighbors for a complimentary breakfast and great conversation.",
      location: "Ground Floor Lounge",
      starts_at: new Date(
        now.getTime() + 4 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 4 days from now
      capacity: 30,
    },
    {
      property_id: property.id,
      title: "Thursday Networking",
      description:
        "Connect with fellow residents who work in tech, design, and creative industries.",
      location: "Co-working Space",
      starts_at: new Date(
        now.getTime() + 6 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 6 days from now
      capacity: 25,
    },
    {
      property_id: property.id,
      title: "Movie Night",
      description:
        "Outdoor cinema experience featuring a classic film. Popcorn provided!",
      location: "Courtyard",
      starts_at: new Date(
        now.getTime() + 8 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 8 days from now
      capacity: 40,
    },
    {
      property_id: property.id,
      title: "Coworking Sprint Session",
      description:
        "Focused work session with coffee and snacks. Great for productivity!",
      location: "Co-working Space",
      starts_at: new Date(
        now.getTime() + 10 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 10 days from now
      capacity: 20,
    },
  ];

  const { error: eventsError } = await supabase.from("events").insert(events);
  if (eventsError) {
    console.error("Error creating events:", eventsError);
    return;
  }
  console.log("✅ Created 5 events");

  // 5. Create maintenance tickets
  console.log("Creating maintenance tickets...");
  const tickets = [
    {
      user_id: userId,
      property_id: property.id,
      title: "Kitchen sink draining slowly",
      category: "Plumbing",
      description:
        "The kitchen sink has been draining very slowly for the past few days. Water pools and takes several minutes to drain completely.",
      status: "open",
    },
    {
      user_id: userId,
      property_id: property.id,
      title: "Bedroom light flickering",
      category: "Electrical",
      description:
        "The main ceiling light in the bedroom flickers intermittently, especially when first turned on.",
      status: "in_progress",
    },
  ];

  const { error: ticketsError } = await supabase
    .from("maintenance_tickets")
    .insert(tickets);
  if (ticketsError) {
    console.error("Error creating tickets:", ticketsError);
    return;
  }
  console.log("✅ Created 2 maintenance tickets");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\nDemo credentials:");
  console.log("  Email: guy@demo.com");
  console.log("  Password: Demo1234!");
}

seed().catch(console.error);
