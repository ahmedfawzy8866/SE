import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/context/LanguageContext";

export function SierraHeader({ title, showBack = true, rightIcon, onRightPress }: { title: string; showBack?: boolean; rightIcon?: any; onRightPress?: () => void; }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { isRTL } = useLanguage();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={[styles.container, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        {showBack && (
          <Pressable style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]} onPress={() => router.back()}>
            <Feather name={isRTL ? "chevron-right" : "chevron-left"} size={24} color={colors.text} />
          </Pressable>
        )}
        <Pressable style={{ flex: 1 }} onPress={() => router.push('/')}>
          <Text style={[styles.title, { color: colors.text, textAlign: showBack ? (isRTL ? "right" : "left") : "center" }]}>
            {title}
          </Text>
        </Pressable>
        {rightIcon && (
          <Pressable style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]} onPress={onRightPress}>
            <Feather name={rightIcon} size={22} color={colors.text} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  container: {
    alignItems: "center",
    height: 44,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -10, // Offset internal padding
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
});
