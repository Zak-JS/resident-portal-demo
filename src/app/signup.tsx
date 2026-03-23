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
import { signUpSchema, SignUpFormData } from "../lib/validators";
import { signUp } from "../lib/auth";

export default function SignUpScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    setError(null);

    try {
      queryClient.clear();
      const result = await signUp(data.email, data.password, data.fullName);

      if (result.user && !result.session) {
        setError(
          "Account created! Please check your email to confirm your account, then sign in.",
        );
        setTimeout(() => router.push("/login"), 3000);
      } else {
        router.replace("/dashboard");
      }
    } catch (err: any) {
      const message = err.message || "";
      if (message.includes("invalid") && message.includes("email")) {
        setError(
          "Sign-up is currently restricted. Please contact support or use the demo account.",
        );
      } else if (message.includes("already registered")) {
        setError("This email is already registered. Try signing in instead.");
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
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
            <View className="items-center mb-8">
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
                <Ionicons name="person-add" size={32} color="#FFFFFF" />
              </View>
              <Text
                className="mb-2 text-2xl text-slate-900"
                style={{ fontFamily: "Inter_700Bold" }}
              >
                Create Account
              </Text>
              <Text
                className="text-sm text-center text-slate-500"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Join your community today
              </Text>
            </View>

            {/* Sign Up Form */}
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
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.fullName?.message}
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                )}
              />

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
                    placeholder="Create a password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    secureTextEntry
                    autoComplete="new-password"
                    hint="Must be at least 8 characters"
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message}
                    secureTextEntry
                    autoComplete="new-password"
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
                  {loading ? "Creating account..." : "Create Account"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Link */}
            <View className="flex-row justify-center">
              <Text
                className="text-slate-500"
                style={{ fontFamily: "Inter_400Regular" }}
              >
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text
                  className="text-primary"
                  style={{ fontFamily: "Inter_600SemiBold" }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
