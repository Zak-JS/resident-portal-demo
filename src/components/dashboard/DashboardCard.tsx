import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DashboardCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  onPress?: () => void;
  actionLabel?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export function DashboardCard({
  title,
  icon,
  children,
  onPress,
  actionLabel,
  iconBgColor = "#FDF2F8",
  iconColor = "#E91E63",
}: DashboardCardProps) {
  return (
    <View
      className="mb-4 bg-white rounded-3xl overflow-hidden border border-slate-100"
      style={{
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center px-5 pt-5 pb-4">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: iconBgColor }}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <Text className="text-base font-bold text-slate-800">{title}</Text>
      </View>

      {/* Content */}
      <View className="px-5 pb-4">{children}</View>

      {/* Action Button */}
      {onPress && actionLabel && (
        <TouchableOpacity
          className="flex-row items-center justify-center py-3.5 mx-4 mb-4 bg-slate-50 rounded-xl border border-slate-100"
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text className="text-sm text-primary font-semibold mr-1.5">
            {actionLabel}
          </Text>
          <Ionicons name="arrow-forward" size={14} color="#E91E63" />
        </TouchableOpacity>
      )}
    </View>
  );
}
