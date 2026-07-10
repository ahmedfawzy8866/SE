import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  useFonts,
} from "@expo-google-fonts/outfit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, StyleSheet, Platform } from "react-native";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WebNav } from "@/components/WebNav";
import { ClaimProvider } from "@/context/ClaimContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { useBreakpoint } from "@/hooks/useBreakpoint";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="property/[id]" options={{ headerShown: false, presentation: "card" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Outfit-Regular": Outfit_400Regular,
    "Outfit-Medium": Outfit_500Medium,
    "Outfit-SemiBold": Outfit_600SemiBold,
    "Outfit-Bold": Outfit_700Bold,
    "Inter-Regular": Outfit_400Regular,
    "Inter-Medium": Outfit_500Medium,
    "Inter-SemiBold": Outfit_600SemiBold,
    "Inter-Bold": Outfit_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <LanguageProvider>
            <ClaimProvider>
              <QueryClientProvider client={queryClient}>
                <FavoritesProvider>
                  <GestureHandlerRootView>
                    <KeyboardProvider>
                      <ActionSheetProvider>
                        <WebWrapper>
                          <RootLayoutNav />
                        </WebWrapper>
                      </ActionSheetProvider>
                    </KeyboardProvider>
                  </GestureHandlerRootView>
                </FavoritesProvider>
              </QueryClientProvider>
            </ClaimProvider>
          </LanguageProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

function WebWrapper({ children }: { children: React.ReactNode }) {
  const { isDesktop, isTablet } = useBreakpoint();

  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  const isWide = isDesktop || isTablet;

  if (isWide) {
    // Full-width desktop/tablet layout with sticky top nav
    return (
      <View style={webStyles.wideRoot}>
        <WebNav />
        <View style={webStyles.wideContent}>
          {children}
        </View>
      </View>
    );
  }

  // Narrow mobile-in-browser: centred phone shell
  return (
    <View style={webStyles.mobileWrapper}>
      <View style={webStyles.mobileContainer}>
        {children}
      </View>
    </View>
  );
}

const webStyles = StyleSheet.create({
  // Desktop / tablet — full width
  wideRoot: {
    flex: 1,
    width: "100%",
    height: "100%",
    flexDirection: "column",
  },
  wideContent: {
    flex: 1,
    width: "100%",
    overflow: "hidden" as any,
  },
  // Mobile browser — centred narrow shell
  mobileWrapper: {
    flex: 1,
    backgroundColor: "#02070E",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  mobileContainer: {
    width: "100%",
    maxWidth: 480,
    height: "100%",
    backgroundColor: "#040C16",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
});
