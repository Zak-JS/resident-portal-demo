import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { EventCard } from "../components/events/EventCard";
import { useEvents, useRsvpToEvent, useCancelRsvp } from "../hooks/useQueries";

type FilterTab = "all" | "my_rsvps";

export default function EventsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const { data: events = [], isLoading, refetch, isRefetching } = useEvents();
  const rsvpMutation = useRsvpToEvent();
  const cancelRsvpMutation = useCancelRsvp();

  const handleRsvp = (eventId: string) => {
    rsvpMutation.mutate(eventId);
  };

  const handleCancelRsvp = (eventId: string) => {
    cancelRsvpMutation.mutate(eventId);
  };

  const filteredEvents =
    activeTab === "my_rsvps" ? events.filter((e) => e.user_has_rsvped) : events;

  const isActionLoading = (eventId: string) =>
    (rsvpMutation.isPending && rsvpMutation.variables === eventId) ||
    (cancelRsvpMutation.isPending && cancelRsvpMutation.variables === eventId);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#E91E63" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["bottom"]}>
      {/* Custom Header */}
      <View
        className="px-5 pt-3 pb-4 bg-white"
        style={{
          shadowColor: "#E91E63",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <LinearGradient
              colors={["#E91E63", "#C2185B"]}
              className="w-12 h-12 rounded-full items-center justify-center mr-3"
              style={{
                shadowColor: "#E91E63",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Ionicons name="calendar" size={24} color="#FFFFFF" />
            </LinearGradient>
            <View className="flex-1">
              <Text
                className="text-primary text-xs"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                Community
              </Text>
              <Text
                className="text-slate-900 text-xl"
                style={{ fontFamily: "Inter_700Bold" }}
              >
                Events
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color="#E91E63" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-5 py-3 bg-white">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-xl mr-2 ${
            activeTab === "all" ? "bg-primary" : "bg-slate-100"
          }`}
          onPress={() => setActiveTab("all")}
          activeOpacity={0.7}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === "all" ? "text-white" : "text-slate-600"
            }`}
          >
            All Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-xl ${
            activeTab === "my_rsvps" ? "bg-primary" : "bg-slate-100"
          }`}
          onPress={() => setActiveTab("my_rsvps")}
          activeOpacity={0.7}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === "my_rsvps" ? "text-white" : "text-slate-600"
            }`}
          >
            My RSVPs
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
          />
        }
      >
        {filteredEvents.length === 0 ? (
          <View className="items-center py-16 bg-white rounded-3xl border border-slate-100">
            <Text className="text-slate-400 text-base font-medium">
              {activeTab === "my_rsvps"
                ? "You haven't RSVPed to any events yet"
                : "No upcoming events"}
            </Text>
          </View>
        ) : (
          filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRsvp={() => handleRsvp(event.id)}
              onCancelRsvp={() => handleCancelRsvp(event.id)}
              loading={isActionLoading(event.id)}
            />
          ))
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
