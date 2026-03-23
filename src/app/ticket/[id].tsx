import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { StatusBadge } from "../../components/ui";
import { useNotifications } from "../../contexts/NotificationContext";
import { deleteMaintenanceTicket } from "../../lib/mutations";
import { showSuccessToast, showErrorToast } from "../../components/ui/Toast";
import type { MaintenanceTicket, TicketResponse } from "../../types";

async function getTicketWithResponses(ticketId: string) {
  const { data: ticket, error: ticketError } = await supabase
    .from("maintenance_tickets")
    .select("*")
    .eq("id", ticketId)
    .single();

  if (ticketError) throw ticketError;

  const { data: responses, error: responsesError } = await supabase
    .from("ticket_responses")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (responsesError) throw responsesError;

  return { ...ticket, responses: responses || [] } as MaintenanceTicket;
}

function TimelineItem({
  response,
  isLast,
}: {
  response: TicketResponse;
  isLast: boolean;
}) {
  const time = new Date(response.created_at).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View className="flex-row">
      {/* Timeline line and dot */}
      <View className="items-center mr-4">
        <View
          className={`w-3 h-3 rounded-full ${response.is_staff ? "bg-primary" : "bg-slate-400"}`}
        />
        {!isLast && <View className="w-0.5 flex-1 bg-slate-200 my-1" />}
      </View>

      {/* Content */}
      <View className="flex-1 pb-6">
        <View className="flex-row items-center mb-1">
          <Text
            className={`text-sm ${response.is_staff ? "text-primary" : "text-slate-600"}`}
            style={{ fontFamily: "Inter_600SemiBold" }}
          >
            {response.is_staff ? "Property Management" : "You"}
          </Text>
          <Text
            className="text-xs text-slate-400 ml-2"
            style={{ fontFamily: "Inter_400Regular" }}
          >
            {time}
          </Text>
          {!response.is_read && response.is_staff && (
            <View className="ml-2 px-2 py-0.5 bg-primary/10 rounded-full">
              <Text
                className="text-xs text-primary"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                New
              </Text>
            </View>
          )}
        </View>
        <View
          className={`p-3 rounded-xl ${response.is_staff ? "bg-primary/5" : "bg-slate-100"}`}
        >
          <Text
            className="text-sm text-slate-700"
            style={{ fontFamily: "Inter_400Regular" }}
          >
            {response.message}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { markAsRead, refreshNotifications } = useNotifications();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: deleteMaintenanceTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenanceTickets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      showSuccessToast("Ticket Deleted", "Your ticket has been removed");
      router.replace("/maintenance");
    },
    onError: (error: Error) => {
      showErrorToast("Delete Failed", error.message);
    },
  });

  const handleDelete = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to delete this ticket? This action cannot be undone.",
      );
      if (confirmed) {
        deleteMutation.mutate(id!);
      }
    } else {
      // Native alert for iOS/Android
      const { Alert } = require("react-native");
      Alert.alert(
        "Delete Ticket",
        "Are you sure you want to delete this ticket? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteMutation.mutate(id!),
          },
        ],
      );
    }
  };

  const {
    data: ticket,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => getTicketWithResponses(id!),
    enabled: !!id,
    refetchInterval: 5000, // Poll every 5 seconds for new responses
  });

  // Mark unread responses as read when viewing
  useEffect(() => {
    if (ticket?.responses) {
      const unreadResponses = ticket.responses.filter(
        (r) => r.is_staff && !r.is_read,
      );
      unreadResponses.forEach((r) => markAsRead(r.id));
      if (unreadResponses.length > 0) {
        refreshNotifications();
      }
    }
  }, [ticket?.responses]);

  if (isLoading || !ticket) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#E91E63" />
      </View>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["bottom"]}>
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
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center mr-3"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#E91E63" />
          </TouchableOpacity>
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
              <Ionicons name="document-text" size={24} color="#FFFFFF" />
            </LinearGradient>
            <View className="flex-1">
              <Text
                className="text-primary text-xs"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                Ticket Details
              </Text>
              <Text
                className="text-slate-900 text-lg"
                style={{ fontFamily: "Inter_700Bold" }}
                numberOfLines={1}
              >
                {ticket.title}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-4">
        {/* Ticket Info Card */}
        <View
          className="bg-white rounded-2xl p-4 mb-4"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <StatusBadge status={ticket.status} />
            <Text
              className="text-xs text-slate-400"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              Created {formatDate(ticket.created_at!)}
            </Text>
          </View>
          <Text
            className="text-sm text-slate-600 mb-2"
            style={{ fontFamily: "Inter_500Medium" }}
          >
            Category: {ticket.category}
          </Text>
          <Text
            className="text-sm text-slate-700"
            style={{ fontFamily: "Inter_400Regular" }}
          >
            {ticket.description}
          </Text>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          onPress={handleDelete}
          disabled={deleteMutation.isPending}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex-row items-center justify-center mb-4"
          activeOpacity={0.7}
        >
          {deleteMutation.isPending ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text
                className="text-red-500 ml-2"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                Delete Ticket
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Timeline */}
        <View className="mb-4">
          <Text
            className="text-lg text-slate-900 mb-4"
            style={{ fontFamily: "Inter_700Bold" }}
          >
            Activity Timeline
          </Text>

          {ticket.responses && ticket.responses.length > 0 ? (
            ticket.responses.map((response, index) => (
              <TimelineItem
                key={response.id}
                response={response}
                isLast={index === ticket.responses!.length - 1}
              />
            ))
          ) : (
            <View className="bg-slate-100 rounded-xl p-4 items-center">
              <Ionicons name="time-outline" size={32} color="#94A3B8" />
              <Text
                className="text-slate-500 text-sm mt-2 text-center"
                style={{ fontFamily: "Inter_500Medium" }}
              >
                No updates yet. We'll notify you when there's a response.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
