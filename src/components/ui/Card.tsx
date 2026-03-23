import React from "react";
import { View, Text } from "react-native";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "elevated" | "outlined" | "filled";
  header?: {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
  };
}

const paddingClasses = {
  none: "p-0",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

const shadowStyles = {
  default: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  elevated: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  outlined: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  filled: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

export function Card({
  children,
  className = "",
  padding = "md",
  variant = "default",
  header,
}: CardProps) {
  const baseClasses = "rounded-3xl overflow-hidden";

  const variantClasses = {
    default: "bg-white border border-slate-100",
    elevated: "bg-white",
    outlined: "bg-white border-2 border-slate-200",
    filled: "bg-slate-50",
  };

  return (
    <View
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={shadowStyles[variant]}
    >
      {header && (
        <View
          className={`flex-row items-center justify-between px-5 pt-5 ${header.subtitle ? "pb-1" : "pb-4"}`}
        >
          <View className="flex-1">
            <Text className="text-lg font-bold text-slate-900">
              {header.title}
            </Text>
            {header.subtitle && (
              <Text className="text-sm text-slate-500 mt-0.5">
                {header.subtitle}
              </Text>
            )}
          </View>
          {header.action}
        </View>
      )}
      <View className={header ? "px-5 pb-5" : paddingClasses[padding]}>
        {children}
      </View>
    </View>
  );
}

export function CardSection({
  children,
  className = "",
  noPadding = false,
}: {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <View
      className={`${noPadding ? "" : "py-3"} border-t border-slate-100 ${className}`}
    >
      {children}
    </View>
  );
}
