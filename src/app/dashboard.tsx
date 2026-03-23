import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQueryClient } from "@tanstack/react-query";
import { StatusBadge } from "../components/ui";
import { useDashboard, useRsvpToEvent } from "../hooks/useQueries";
import { signOut } from "../lib/auth";
import { useNotifications } from "../contexts/NotificationContext";

export default function DashboardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, refetch, isRefetching } = useDashboard();
  const rsvpMutation = useRsvpToEvent();
  const { notifications, unreadCount } = useNotifications();

  const handleRsvp = (eventId: string) => {
    rsvpMutation.mutate(eventId);
  };

  const handleNotificationPress = () => {
    // Navigate to the first unread notification's ticket, or notifications list
    const unreadNotif = notifications.find((n) => !n.isRead);
    if (unreadNotif) {
      router.push(`/ticket/${unreadNotif.ticketId}` as any);
    } else if (notifications.length > 0) {
      router.push(`/ticket/${notifications[0].ticketId}` as any);
    } else {
      router.push("/maintenance");
    }
  };

  const handleSignOut = async () => {
    try {
      // Clear all cached data before signing out
      queryClient.clear();
      await signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const firstName = data?.profile?.full_name?.split(" ")[0] || "";

  // Show loading screen while fetching user data
  if (isLoading || !data) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#E91E63" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
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
              <Text
                className="text-white text-lg"
                style={{ fontFamily: "Inter_700Bold" }}
              >
                {firstName.charAt(0).toUpperCase() || "?"}
              </Text>
            </LinearGradient>
            <View className="flex-1">
              <Text
                className="text-primary text-xs"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                Good{" "}
                {new Date().getHours() < 12
                  ? "morning"
                  : new Date().getHours() < 18
                    ? "afternoon"
                    : "evening"}
              </Text>
              <Text
                className="text-slate-900 text-xl"
                style={{ fontFamily: "Inter_700Bold" }}
              >
                {firstName || "User"}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={handleNotificationPress}
              className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="notifications" size={22} color="#E91E63" />
              {unreadCount > 0 && (
                <View
                  className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-5 h-5 items-center justify-center px-1"
                  style={{
                    shadowColor: "#EF4444",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    elevation: 3,
                  }}
                >
                  <Text
                    className="text-white text-xs"
                    style={{ fontFamily: "Inter_700Bold" }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSignOut}
              className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="log-out" size={22} color="#E91E63" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#E91E63"
          />
        }
      >
        {/* Property Info Card */}
        {data?.property && (
          <LinearGradient
            colors={["#EC407A", "#E91E63", "#C2185B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-3xl p-5 mb-5"
            style={{
              shadowColor: "#E91E63",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text
                  className="text-white/80 text-xs mb-1"
                  style={{ fontFamily: "Inter_500Medium" }}
                >
                  Your Property
                </Text>
                <Text
                  className="text-white text-xl"
                  style={{ fontFamily: "Inter_700Bold" }}
                >
                  {data.property.name}
                </Text>
                {data.profile?.unit_label && (
                  <View className="flex-row items-center mt-2">
                    <View className="bg-white/20 rounded-full px-3 py-1">
                      <Text
                        className="text-white text-sm"
                        style={{ fontFamily: "Inter_600SemiBold" }}
                      >
                        Unit {data.profile.unit_label}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              <View className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center">
                <Ionicons name="home" size={28} color="#FFFFFF" />
              </View>
            </View>
            {data.property.address && (
              <Text
                className="text-white/70 text-xs mt-3"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                📍 {data.property.address}
              </Text>
            )}
          </LinearGradient>
        )}
        {/* Upcoming Event */}
        <TouchableOpacity
          onPress={() => router.push("/events")}
          activeOpacity={0.7}
          className="mb-4"
        >
          <View
            className="bg-white rounded-2xl p-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            {data?.upcomingEvent ? (
              <View>
                <View className="flex-row">
                  {/* Date Box */}
                  <View
                    className={`rounded-xl w-16 h-16 items-center justify-center mr-4 ${data?.isRsvpedEvent ? "bg-primary" : "bg-slate-200"}`}
                  >
                    <Text
                      className={`text-2xl font-bold ${data?.isRsvpedEvent ? "text-white" : "text-slate-600"}`}
                    >
                      {new Date(data.upcomingEvent.starts_at).getDate()}
                    </Text>
                    <Text
                      className={`text-xs font-medium uppercase ${data?.isRsvpedEvent ? "text-white/80" : "text-slate-500"}`}
                    >
                      {new Date(
                        data.upcomingEvent.starts_at,
                      ).toLocaleDateString("en-GB", { month: "short" })}
                    </Text>
                  </View>

                  {/* Event Info */}
                  <View className="flex-1 justify-center">
                    <Text className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">
                      {data?.isRsvpedEvent
                        ? "Your Next Event"
                        : "Suggested Event"}
                    </Text>
                    <Text className="text-base font-bold text-slate-900 mb-1">
                      {data.upcomingEvent.title}
                    </Text>
                    <Text className="text-sm text-slate-500">
                      {formatEventDate(data.upcomingEvent.starts_at)}
                      {data.upcomingEvent.location &&
                        ` · ${data.upcomingEvent.location}`}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </View>

                {/* RSVP Prompt for non-RSVPed events */}
                {!data?.isRsvpedEvent && data.upcomingEvent && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRsvp(data.upcomingEvent!.id);
                    }}
                    activeOpacity={0.7}
                    className="mt-3 pt-3 border-t border-slate-100 flex-row items-center justify-between"
                  >
                    <Text
                      className="text-sm text-slate-500"
                      style={{ fontFamily: "Inter_400Regular" }}
                    >
                      Interested in attending?
                    </Text>
                    <View
                      className={`flex-row items-center px-3 py-1.5 rounded-full ${rsvpMutation.isPending ? "bg-slate-100" : "bg-primary/10"}`}
                    >
                      {rsvpMutation.isPending ? (
                        <ActivityIndicator size="small" color="#E91E63" />
                      ) : (
                        <>
                          <Ionicons
                            name="add-circle"
                            size={16}
                            color="#E91E63"
                          />
                          <Text
                            className="text-primary text-sm ml-1"
                            style={{ fontFamily: "Inter_600SemiBold" }}
                          >
                            RSVP
                          </Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View className="flex-row items-center">
                <View className="bg-slate-100 rounded-xl w-16 h-16 items-center justify-center mr-4">
                  <Ionicons name="calendar-outline" size={28} color="#94A3B8" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-slate-400">
                    No upcoming events
                  </Text>
                  <Text className="text-sm text-slate-400">
                    Tap to browse all events
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Maintenance */}
        <TouchableOpacity
          onPress={() => router.push("/maintenance")}
          activeOpacity={0.7}
          className="mb-6"
        >
          <View
            className="bg-white rounded-2xl p-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center">
              {/* Icon */}
              <View className="bg-blue-500 rounded-xl w-16 h-16 items-center justify-center mr-4">
                <Ionicons name="construct" size={28} color="#FFFFFF" />
              </View>

              {/* Info */}
              <View className="flex-1">
                <Text className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-1">
                  Maintenance
                </Text>
                {data?.latestTicket ? (
                  <>
                    <Text
                      className="text-base font-bold text-slate-900 mb-1"
                      numberOfLines={1}
                    >
                      {data.latestTicket.title}
                    </Text>
                    <View className="flex-row items-center">
                      <StatusBadge status={data.latestTicket.status} />
                      {(data?.openTicketsCount || 0) > 1 && (
                        <Text className="text-xs text-slate-400 ml-2">
                          +{(data.openTicketsCount || 1) - 1} more
                        </Text>
                      )}
                    </View>
                  </>
                ) : (
                  <Text className="text-sm text-slate-400">
                    No open tickets · Tap to submit
                  </Text>
                )}
              </View>

              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            className="flex-1"
            onPress={() => router.push("/events")}
            activeOpacity={0.7}
          >
            <View
              className="bg-white rounded-2xl p-4 items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="w-12 h-12 rounded-full bg-pink-50 items-center justify-center mb-2">
                <Ionicons name="calendar" size={24} color="#E91E63" />
              </View>
              <Text className="text-sm font-semibold text-slate-800">
                Events
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1"
            onPress={() => router.push("/maintenance")}
            activeOpacity={0.7}
          >
            <View
              className="bg-white rounded-2xl p-4 items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-2">
                <Ionicons name="construct" size={24} color="#3B82F6" />
              </View>
              <Text className="text-sm font-semibold text-slate-800">
                Maintenance
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1"
            onPress={() => router.push("/concierge")}
            activeOpacity={0.7}
          >
            <View
              className="bg-white rounded-2xl p-4 items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="w-12 h-12 rounded-full bg-purple-50 items-center justify-center mb-2">
                <Ionicons
                  name="chatbubble-ellipses"
                  size={24}
                  color="#8B5CF6"
                />
              </View>
              <Text className="text-sm font-semibold text-slate-800">
                Concierge
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Concierge AI Banner */}
        <TouchableOpacity
          onPress={() => router.push("/concierge")}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#E91E63", "#C2185B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-2xl p-4 mb-6 flex-row items-center"
            style={{
              shadowColor: "#E91E63",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center mr-3">
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">
                Ask Concierge AI
              </Text>
              <Text className="text-white/70 text-xs">
                Get help with anything
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
