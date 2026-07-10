import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/context/LanguageContext";
import { useBreakpoint } from "@/hooks/useBreakpoint";

export default function TabLayout() {
  const colors = useColors();
  const { t } = useLanguage();
  const { isDesktop, isTablet } = useBreakpoint();
  const isIOS = Platform.OS === "ios";
  const hideTabBar = Platform.OS === "web" && (isDesktop || isTablet);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.tabBarBorder,
          elevation: 0,
          height: Platform.OS === "web" ? 84 : 60,
          display: hideTabBar ? "none" : "flex",
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={90}
              tint={colors.statusBar === "dark" ? "light" : "dark"}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.tabBar }]} />
          ),
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
        animation: "fade",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.navHome,
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="house" tintColor={color} size={22} /> : <Feather name="home" size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="listings"
        options={{
          title: t.navSearch,
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="magnifyingglass" tintColor={color} size={22} /> : <Feather name="search" size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t.navMap,
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="map" tintColor={color} size={22} /> : <Feather name="map" size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t.navSaved,
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="heart" tintColor={color} size={22} /> : <Feather name="heart" size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.navAccount,
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="person" tintColor={color} size={22} /> : <Feather name="user" size={21} color={color} />,
        }}
      />
    </Tabs>
  );
}
