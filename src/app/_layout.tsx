import { useEffect, useCallback } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, Text } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { useSession } from "../hooks/useSession";
import { queryClient } from "../lib/queryClient";
import { Toast, toastConfig } from "../components/ui/Toast";
import { NotificationProvider } from "../contexts/NotificationContext";
import "../../global.css";

SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "signup";

    if (!session && !inAuthGroup) {
      router.replace("/login");
    } else if (session && inAuthGroup) {
      router.replace("/dashboard");
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#E91E63" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <AuthGuard>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: "#FFFFFF",
                },
                headerTintColor: "#E91E63",
                headerTitleStyle: {
                  fontFamily: "Inter_700Bold",
                  fontSize: 18,
                  color: "#1E293B",
                },
                headerShadowVisible: true,
                headerTitleAlign: "center",
                contentStyle: {
                  backgroundColor: "#F8FAFC",
                },
                animation: "slide_from_right",
              }}
            >
              <Stack.Screen
                name="login"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="signup"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="dashboard"
                options={{
                  title: "Home",
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="events"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="maintenance"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="concierge"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="ticket/[id]"
                options={{
                  headerShown: false,
                  presentation: "modal",
                }}
              />
            </Stack>
          </AuthGuard>
          <Toast config={toastConfig} />
        </NotificationProvider>
      </QueryClientProvider>
    </View>
  );
}
