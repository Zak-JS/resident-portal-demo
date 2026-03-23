import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  icon?: string;
  iconPosition?: "left" | "right";
}

const variantClasses = {
  primary: "bg-primary",
  secondary: "bg-primary-50 border border-primary-100",
  outline: "bg-white border-2 border-slate-200",
  ghost: "bg-transparent",
  danger: "bg-error",
};

const textVariantClasses = {
  primary: "text-white",
  secondary: "text-primary-700",
  outline: "text-slate-700",
  ghost: "text-primary",
  danger: "text-white",
};

const sizeClasses = {
  sm: "py-2.5 px-4 min-h-[40px]",
  md: "py-3.5 px-6 min-h-[50px]",
  lg: "py-4 px-8 min-h-[56px]",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

const iconSizes = {
  sm: 16,
  md: 18,
  lg: 20,
};

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  icon,
  iconPosition = "left",
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const iconColor =
    variant === "primary" || variant === "danger" ? "#FFFFFF" : "#E91E63";

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "danger"
              ? "#FFFFFF"
              : "#E91E63"
          }
          size="small"
        />
      );
    }

    return (
      <View className="flex-row justify-center items-center">
        {icon && iconPosition === "left" && (
          <View className="mr-2">
            <Ionicons
              name={icon as any}
              size={iconSizes[size]}
              color={iconColor}
            />
          </View>
        )}
        <Text
          className={`font-semibold ${textVariantClasses[variant]} ${textSizeClasses[size]}`}
        >
          {title}
        </Text>
        {icon && iconPosition === "right" && (
          <View className="ml-2">
            <Ionicons
              name={icon as any}
              size={iconSizes[size]}
              color={iconColor}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      className={`
        items-center justify-center rounded-2xl
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${isDisabled ? "opacity-50" : "active:opacity-80"}
        ${className}
      `}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}
