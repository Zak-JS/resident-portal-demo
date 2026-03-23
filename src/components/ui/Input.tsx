import React, { useState } from "react";
import { View, TextInput, Text, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  containerClassName = "",
  className = "",
  hint,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-sm font-semibold text-slate-700 mb-2">
          {label}
        </Text>
      )}
      <TextInput
        className={`
          bg-slate-50 border-2 rounded-xl px-4 py-3.5 text-base text-slate-800
          ${error ? "border-error bg-error-light" : isFocused ? "border-primary bg-white" : "border-slate-200"}
          ${className}
        `}
        placeholderTextColor="#94A3B8"
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && (
        <Text className="text-xs text-error mt-2 font-medium">{error}</Text>
      )}
      {hint && !error && (
        <Text className="text-xs text-slate-400 mt-1.5">{hint}</Text>
      )}
    </View>
  );
}
