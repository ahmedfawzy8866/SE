import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PropertyCard } from "@/components/PropertyCard";
import { useFavorites } from "@/context/FavoritesContext";
import { PROPERTIES } from "@/data/properties";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";

export default function FavoritesScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { favorites } = useFavorites();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const saved = PROPERTIES.filter((p) => favorites.includes(p.id));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: isDark ? colors.navyDeep : colors.surfaceAlt, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Saved Properties</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {saved.length} saved {saved.length === 1 ? "property" : "properties"}
        </Text>
      </View>

      {saved.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="heart" size={36} color={colors.gold} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No saved properties</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
            Tap the heart icon on any listing to save it here for easy access.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.browseBtn, { backgroundColor: colors.gold, opacity: pressed ? 0.85 : 1 }]}
            onPress={() => router.push("/listings" as any)}
          >
            <Text style={[styles.browseBtnText, { color: colors.navyDeep }]}>Browse Listings</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <PropertyCard property={item} />}
          contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 34 + 84 : 100 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 28, fontWeight: "800", marginTop: 8, marginBottom: 2 },
  subtitle: { fontSize: 14 },
  list: { padding: 16, paddingTop: 20 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40, gap: 14 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  browseBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 6 },
  browseBtnText: { fontSize: 14, fontWeight: "700" },
});
