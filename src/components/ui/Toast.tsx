import React from "react";
import { View, Text } from "react-native";
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
  ToastConfigParams,
} from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

const toastConfig: ToastConfig = {
  success: (props: ToastConfigParams<any>) => (
    <View
      className="mx-4 px-4 py-3 bg-white rounded-2xl flex-row items-center"
      style={{
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center mr-3">
        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
      </View>
      <View className="flex-1">
        <Text
          className="text-slate-900 text-base"
          style={{ fontFamily: "Inter_600SemiBold" }}
        >
          {props.text1}
        </Text>
        {props.text2 && (
          <Text
            className="text-slate-500 text-sm mt-0.5"
            style={{ fontFamily: "Inter_400Regular" }}
          >
            {props.text2}
          </Text>
        )}
      </View>
    </View>
  ),

  error: (props: ToastConfigParams<any>) => (
    <View
      className="mx-4 px-4 py-3 bg-white rounded-2xl flex-row items-center"
      style={{
        shadowColor: "#EF4444",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3">
        <Ionicons name="close-circle" size={24} color="#EF4444" />
      </View>
      <View className="flex-1">
        <Text
          className="text-slate-900 text-base"
          style={{ fontFamily: "Inter_600SemiBold" }}
        >
          {props.text1}
        </Text>
        {props.text2 && (
          <Text
            className="text-slate-500 text-sm mt-0.5"
            style={{ fontFamily: "Inter_400Regular" }}
          >
            {props.text2}
          </Text>
        )}
      </View>
    </View>
  ),

  info: (props: ToastConfigParams<any>) => (
    <View
      className="mx-4 px-4 py-3 bg-white rounded-2xl flex-row items-center"
      style={{
        shadowColor: "#E91E63",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
        <Ionicons name="information-circle" size={24} color="#E91E63" />
      </View>
      <View className="flex-1">
        <Text
          className="text-slate-900 text-base"
          style={{ fontFamily: "Inter_600SemiBold" }}
        >
          {props.text1}
        </Text>
        {props.text2 && (
          <Text
            className="text-slate-500 text-sm mt-0.5"
            style={{ fontFamily: "Inter_400Regular" }}
          >
            {props.text2}
          </Text>
        )}
      </View>
    </View>
  ),
};

export { Toast, toastConfig };

export const showSuccessToast = (title: string, message?: string) => {
  Toast.show({
    type: "success",
    text1: title,
    text2: message,
    position: "bottom",
    visibilityTime: 3000,
    bottomOffset: 100,
  });
};

export const showErrorToast = (title: string, message?: string) => {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
    position: "bottom",
    visibilityTime: 4000,
    bottomOffset: 100,
  });
};

export const showInfoToast = (title: string, message?: string) => {
  Toast.show({
    type: "info",
    text1: title,
    text2: message,
    position: "bottom",
    visibilityTime: 3000,
    bottomOffset: 100,
  });
};
