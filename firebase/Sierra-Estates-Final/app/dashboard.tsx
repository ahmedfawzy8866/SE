import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useActionSheet } from "@expo/react-native-action-sheet";

import { SierraHeader } from "@/components/SierraHeader";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/context/LanguageContext";
import { PROPERTIES } from "@/data/properties";

type Property = typeof PROPERTIES[0];

export default function DashboardScreen() {
  const colors = useColors();
  const { isRTL } = useLanguage();
  const router = useRouter();
  const { showActionSheetWithOptions } = useActionSheet();

  const [properties, setProperties] = useState<Property[]>(PROPERTIES.slice(0, 5));
  const [isSyncing, setIsSyncing] = useState(false);

  // Optimistic UI Delete
  const handleDelete = (id: string) => {
    // 1. Update UI immediately
    setProperties((prev) => prev.filter((p) => p.id !== id));
    setIsSyncing(true);

    // 2. Simulate API call
    setTimeout(() => {
      setIsSyncing(false);
      // In a real app, if the API failed, we would revert the state here
    }, 1000);
  };

  // ActionSheet for Status
  const handleStatusChange = (propertyId: string) => {
    const options = ["Active", "Pending", "Sold", "Cancel"];
    const destructiveButtonIndex = 3;
    const cancelButtonIndex = 3;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
        title: "Change Property Status",
        userInterfaceStyle: "dark",
      },
      (selectedIndex?: number) => {
        if (selectedIndex !== undefined && selectedIndex !== cancelButtonIndex) {
          // Optimistic UI Update for status
          console.log(`Changed status of ${propertyId} to ${options[selectedIndex]}`);
        }
      }
    );
  };

  const rowDir = isRTL ? "row-reverse" : "row";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SierraHeader
        title="Dashboard"
        rightIcon="plus"
        onRightPress={() => {
          // Optimistic Add
          const newProp: Property = { ...properties[0], id: Date.now().toString(), title: "New Listing" };
          setProperties([newProp, ...properties]);
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]}>My Listings</Text>
          {isSyncing && (
            <Text style={[styles.syncText, { color: colors.gold }]}>Syncing...</Text>
          )}
        </View>

        {properties.map((prop) => (
          <View key={prop.id} style={[styles.card, { borderColor: colors.border, flexDirection: rowDir }]}>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>
                {prop.title}
              </Text>
              <Text style={[styles.cardSub, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>
                {prop.price} · {prop.location}
              </Text>
            </View>
            <View style={[styles.cardActions, { flexDirection: rowDir }]}>
              <Pressable
                onPress={() => handleStatusChange(prop.id)}
                style={[styles.actionBtn, { backgroundColor: colors.surface }]}
              >
                <Feather name="tag" size={16} color={colors.text} />
              </Pressable>
              <Pressable
                onPress={() => handleDelete(prop.id)}
                style={[styles.actionBtn, { backgroundColor: "rgba(255,0,0,0.1)" }]}
              >
                <Feather name="trash-2" size={16} color="#FF453A" />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter-SemiBold",
  },
  syncText: {
    fontSize: 14,
    fontFamily: "JetBrainsMono-Regular",
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  cardActions: {
    gap: 8,
  },
  actionBtn: {
    padding: 10,
    borderRadius: 8,
  },
});
