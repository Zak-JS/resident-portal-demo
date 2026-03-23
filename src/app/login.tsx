import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "../components/ui";
import { loginSchema, LoginFormData } from "../lib/validators";
import { signIn } from "../lib/auth";

export default function LoginScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "guy@demo.com",
      password: "Demo1234!",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    try {
      queryClient.clear();
      await signIn(data.email, data.password);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="px-6"
        >
          <View className="flex-1 justify-center py-8">
            {/* Header */}
            <View className="items-center mb-10">
              <View
                className="justify-center items-center mb-5 w-16 h-16 rounded-2xl bg-primary"
                style={{
                  shadowColor: "#E91E63",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Ionicons name="home" size={32} color="#FFFFFF" />
              </View>
              <Text
                className="mb-2 text-2xl text-slate-900"
                style={{ fontFamily: "Inter_700Bold" }}
              >
                Resident Portal
              </Text>
              <Text
                className="text-sm text-center text-slate-500"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Sign in to access your community
              </Text>
            </View>

            {/* Login Form */}
            <View
              className="mb-6 bg-white rounded-2xl p-5"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              {error && (
                <View className="p-3 mb-4 bg-red-50 rounded-xl">
                  <Text
                    className="text-sm text-red-600"
                    style={{ fontFamily: "Inter_500Medium" }}
                  >
                    {error}
                  </Text>
                </View>
              )}

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email"
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    secureTextEntry
                    autoComplete="password"
                  />
                )}
              />

              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
                className="bg-primary rounded-xl py-4 items-center mt-2"
                activeOpacity={0.8}
                style={{
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <Text
                  className="text-white text-base"
                  style={{ fontFamily: "Inter_600SemiBold" }}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center mb-6">
              <Text
                className="text-slate-500"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text
                  className="text-primary"
                  style={{ fontFamily: "Inter_600SemiBold" }}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Demo Credentials */}
            <View
              className="p-4 bg-blue-50 rounded-2xl"
              style={{
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="information-circle" size={18} color="#3B82F6" />
                <Text
                  className="ml-2 text-blue-700"
                  style={{ fontFamily: "Inter_600SemiBold" }}
                >
                  Demo Credentials
                </Text>
              </View>
              <Text
                className="text-sm text-blue-600"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Email: guy@demo.com
              </Text>
              <Text
                className="text-sm text-blue-600"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Password: Demo1234!
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
