import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Badge } from "../ui";
import type { Event } from "../../types";

interface EventCardProps {
  event: Event;
  onRsvp: () => void;
  onCancelRsvp: () => void;
  loading?: boolean;
}

export function EventCard({
  event,
  onRsvp,
  onCancelRsvp,
  loading,
}: EventCardProps) {
  const eventDate = new Date(event.starts_at);
  const formattedTime = eventDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const spotsLeft = event.capacity
    ? event.capacity - (event.rsvp_count || 0)
    : null;
  const isAlmostFull = spotsLeft !== null && spotsLeft <= 5 && spotsLeft > 0;

  return (
    <View
      className="mb-4 bg-white rounded-2xl"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <View className="p-4">
        <View className="flex-row">
          {/* Date Box */}
          <View className="bg-primary rounded-xl w-14 h-14 items-center justify-center mr-3">
            <Text
              className="text-white text-xl font-bold"
              style={{ fontFamily: "Inter_700Bold" }}
            >
              {eventDate.getDate()}
            </Text>
            <Text
              className="text-white/80 text-xs font-medium uppercase"
              style={{ fontFamily: "Inter_500Medium" }}
            >
              {eventDate.toLocaleDateString("en-GB", { month: "short" })}
            </Text>
          </View>

          {/* Event Info */}
          <View className="flex-1 justify-center">
            <View className="flex-row items-center mb-1">
              <Text
                className="text-base font-bold text-slate-900 flex-1 mr-2"
                style={{ fontFamily: "Inter_700Bold" }}
                numberOfLines={1}
              >
                {event.title}
              </Text>
              {event.user_has_rsvped && (
                <View className="bg-emerald-100 px-2 py-0.5 rounded-full">
                  <Text
                    className="text-xs text-emerald-700 font-semibold"
                    style={{ fontFamily: "Inter_600SemiBold" }}
                  >
                    Going
                  </Text>
                </View>
              )}
            </View>
            <Text
              className="text-sm text-slate-500"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              {formattedTime}
              {event.location && ` · ${event.location}`}
            </Text>
          </View>
        </View>

        {event.description && (
          <Text
            className="text-sm text-slate-600 mt-3"
            style={{ fontFamily: "Inter_400Regular", lineHeight: 20 }}
            numberOfLines={2}
          >
            {event.description}
          </Text>
        )}

        {/* Capacity indicator */}
        {event.capacity && (
          <View className="mt-3">
            <View className="flex-row justify-between mb-1.5">
              <Text
                className="text-xs text-slate-400"
                style={{ fontFamily: "Inter_500Medium" }}
              >
                {event.rsvp_count || 0}/{event.capacity} attending
              </Text>
              {isAlmostFull && (
                <Text
                  className="text-xs text-amber-600"
                  style={{ fontFamily: "Inter_600SemiBold" }}
                >
                  {spotsLeft} spots left
                </Text>
              )}
            </View>
            <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <View
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${Math.min(((event.rsvp_count || 0) / event.capacity) * 100, 100)}%`,
                }}
              />
            </View>
          </View>
        )}

        {/* Action */}
        <View className="flex-row justify-end mt-4">
          {event.user_has_rsvped ? (
            <TouchableOpacity
              onPress={onCancelRsvp}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-slate-200"
              activeOpacity={0.7}
            >
              <Text
                className="text-sm text-slate-600"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                Cancel RSVP
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onRsvp}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-primary"
              activeOpacity={0.7}
            >
              <Text
                className="text-sm text-white"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                RSVP
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
