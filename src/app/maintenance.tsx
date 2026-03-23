import React from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { TicketForm } from "../components/maintenance/TicketForm";
import { TicketCard } from "../components/maintenance/TicketCard";
import {
  useMaintenanceTickets,
  useCreateMaintenanceTicket,
} from "../hooks/useQueries";
import type { MaintenanceTicketFormData } from "../lib/validators";

export default function MaintenanceScreen() {
  const router = useRouter();
  const {
    data: tickets = [],
    isLoading,
    refetch,
    isRefetching,
  } = useMaintenanceTickets();
  const createTicketMutation = useCreateMaintenanceTicket();

  const handleSubmitTicket = (data: MaintenanceTicketFormData) => {
    createTicketMutation.mutate(data);
  };

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
        <View className="flex-row justify-between items-center">
          <View className="flex-row flex-1 items-center">
            <LinearGradient
              colors={["#E91E63", "#C2185B"]}
              className="justify-center items-center mr-3 w-12 h-12 rounded-full"
              style={{
                shadowColor: "#E91E63",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Ionicons name="construct" size={24} color="#FFFFFF" />
            </LinearGradient>
            <View className="flex-1">
              <Text
                className="text-xs text-primary"
                style={{ fontFamily: "Inter_600SemiBold" }}
              >
                Request Help
              </Text>
              <Text
                className="text-xl text-slate-900"
                style={{ fontFamily: "Inter_700Bold" }}
              >
                Maintenance
              </Text>
            </View>
          </View>
          <View className="flex-row gap-3 items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="justify-center items-center w-11 h-11 rounded-full bg-primary/10"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color="#E91E63" />
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
          />
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* Submit Form */}
        <TicketForm
          onSubmit={handleSubmitTicket}
          loading={createTicketMutation.isPending}
        />

        {/* Tickets List */}
        <View className="mb-4">
          <Text className="mb-3 ml-1 text-xs font-bold tracking-widest uppercase text-slate-400">
            My Tickets
          </Text>

          {tickets.length === 0 ? (
            <View className="items-center p-8 bg-white rounded-3xl border border-slate-100">
              <Text className="text-base font-medium text-slate-400">
                No maintenance tickets yet
              </Text>
            </View>
          ) : (
            tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          )}
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
