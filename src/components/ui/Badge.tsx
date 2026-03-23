import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "primary";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
  size?: "sm" | "md";
  icon?: string;
}

const variantClasses: Record<
  BadgeVariant,
  { bg: string; text: string; icon: string; border: string }
> = {
  default: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    icon: "#64748B",
    border: "border-slate-200",
  },
  success: {
    bg: "bg-success-light",
    text: "text-success-dark",
    icon: "#059669",
    border: "border-emerald-200",
  },
  warning: {
    bg: "bg-warning-light",
    text: "text-warning-dark",
    icon: "#D97706",
    border: "border-amber-200",
  },
  error: {
    bg: "bg-error-light",
    text: "text-error-dark",
    icon: "#DC2626",
    border: "border-red-200",
  },
  info: {
    bg: "bg-info-light",
    text: "text-info-dark",
    icon: "#2563EB",
    border: "border-blue-200",
  },
  primary: {
    bg: "bg-primary-50",
    text: "text-primary-700",
    icon: "#BE185D",
    border: "border-primary-200",
  },
};

const sizeClasses = {
  sm: { container: "px-2.5 py-1", text: "text-xs" },
  md: { container: "px-3 py-1.5", text: "text-xs" },
};

export function Badge({
  label,
  variant = "default",
  className = "",
  size = "md",
  icon,
}: BadgeProps) {
  const classes = variantClasses[variant];
  const sizes = sizeClasses[size];

  return (
    <View
      className={`flex-row items-center rounded-full self-start ${classes.bg} ${sizes.container} ${className}`}
    >
      {icon && (
        <View className="mr-1">
          <Ionicons
            name={icon as any}
            size={size === "sm" ? 10 : 12}
            color={classes.icon}
          />
        </View>
      )}
      <Text className={`font-semibold ${classes.text} ${sizes.text}`}>
        {label}
      </Text>
    </View>
  );
}

const statusConfig: Record<string, { variant: BadgeVariant; icon: string }> = {
  open: { variant: "warning", icon: "alert-circle" },
  in_progress: { variant: "info", icon: "time" },
  resolved: { variant: "success", icon: "checkmark-circle" },
  closed: { variant: "success", icon: "checkmark-circle" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status.toLowerCase()] || {
    variant: "default" as BadgeVariant,
    icon: "",
  };

  const formatLabel = (s: string) => {
    return s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Badge
      label={formatLabel(status)}
      variant={config.variant}
      icon={config.icon}
    />
  );
}
