import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBadge } from "../ui";
import type { MaintenanceTicket } from "../../types";

const CATEGORY_CONFIG: Record<
  string,
  { icon: string; color: string; bg: string }
> = {
  Plumbing: { icon: "water", color: "#3B82F6", bg: "#3B82F6" },
  Electrical: { icon: "flash", color: "#F59E0B", bg: "#F59E0B" },
  Heating: { icon: "thermometer", color: "#EF4444", bg: "#EF4444" },
  Cleaning: { icon: "sparkles", color: "#10B981", bg: "#10B981" },
  Other: { icon: "construct", color: "#64748B", bg: "#64748B" },
};

interface TicketCardProps {
  ticket: MaintenanceTicket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const router = useRouter();
  const createdDate = ticket.created_at
    ? new Date(ticket.created_at)
    : new Date();
  const formattedDate = createdDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  const config = CATEGORY_CONFIG[ticket.category] || CATEGORY_CONFIG.Other;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/ticket/${ticket.id}` as any)}
      activeOpacity={0.7}
      className="mb-3 bg-white rounded-2xl p-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <View className="flex-row">
        {/* Category icon */}
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: config.bg }}
        >
          <Ionicons name={config.icon as any} size={22} color="#FFFFFF" />
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1">
            <Text
              className="text-base font-bold text-slate-900 flex-1 mr-2"
              style={{ fontFamily: "Inter_700Bold" }}
              numberOfLines={1}
            >
              {ticket.title}
            </Text>
            <StatusBadge status={ticket.status} />
          </View>

          <Text
            className="text-sm text-slate-500 mb-2"
            style={{ fontFamily: "Inter_400Regular" }}
            numberOfLines={1}
          >
            {ticket.description}
          </Text>

          <View className="flex-row items-center justify-between">
            <Text
              className="text-xs text-slate-400"
              style={{ fontFamily: "Inter_500Medium" }}
            >
              {ticket.category} · {formattedDate}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
