import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFavorites } from "@/context/FavoritesContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { favorites } = useFavorites();
  const { isDark, toggleTheme } = useTheme();
  const { t, isRTL, toggleLanguage, language } = useLanguage();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const rowDir = isRTL ? "row-reverse" : "row";

  const MENU_ITEMS = [
    { icon: "bell", label: t.notifications, sub: t.notificationsSub },
    { icon: "map-pin", label: t.preferredLocations, sub: t.preferredLocationsSub },
    { icon: "sliders", label: t.aiPreferences, sub: t.aiPreferencesSub },
    { icon: "bar-chart-2", label: t.portfolioOverview, sub: t.portfolioOverviewSub },
    { icon: "shield", label: t.verificationStatus, sub: t.verificationStatusSub },
    { icon: "help-circle", label: t.support, sub: t.supportSub },
    { icon: "grid", label: "Dashboard", sub: "Manage Properties", route: "/dashboard" },
    { icon: "settings", label: "Admin Settings", sub: "System Configuration", route: "/admin" },
  ] as const;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 : 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerBg, { paddingTop: topPad + 16, backgroundColor: isDark ? colors.navyDeep : colors.surfaceAlt, borderBottomColor: colors.border }]}>
        <View style={[styles.avatarRow, { flexDirection: rowDir }]}>
          <View style={[styles.avatar, { backgroundColor: colors.card, borderColor: colors.gold }]}>
            <Text style={[styles.avatarInitials, { color: colors.gold }]}>JD</Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={[styles.name, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>James Davidson</Text>
            <View style={[styles.verifiedBadge, { backgroundColor: colors.gold + "22", borderColor: colors.gold + "44", flexDirection: rowDir }]}>
              <Feather name="check-circle" size={11} color={colors.gold} />
              <Text style={[styles.verifiedText, { color: colors.gold }]}>{t.verifiedInvestor}</Text>
            </View>
          </View>
          <Pressable
            style={[styles.editBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Feather name="edit-2" size={15} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <View style={[styles.statsStrip, { flexDirection: rowDir }]}>
          <StatItem value={favorites.length.toString()} label={t.navSaved} colors={colors} />
          <View style={[styles.stripDivider, { backgroundColor: colors.border }]} />
          <StatItem value="$0" label={t.portfolio} colors={colors} />
          <View style={[styles.stripDivider, { backgroundColor: colors.border }]} />
          <StatItem value="0" label={t.enquiries} colors={colors} />
        </View>
      </View>

      <View style={styles.body}>
        <ToggleCard
          icon={isDark ? "moon" : "sun"}
          title={isDark ? t.darkMode : t.lightMode}
          sub={t.tapSwitch}
          active={isDark}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleTheme(); }}
          colors={colors}
          isRTL={isRTL}
          rowDir={rowDir}
        />

        <ToggleCard
          icon="globe"
          title={t.language}
          sub={t.languageSub}
          active={language === "ar"}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleLanguage(); }}
          colors={colors}
          isRTL={isRTL}
          rowDir={rowDir}
          label={language === "en" ? "EN" : "ع"}
        />

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>{t.account}</Text>
        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {MENU_ITEMS.map((item, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [
                styles.menuItem,
                { borderBottomColor: colors.border, borderBottomWidth: i < MENU_ITEMS.length - 1 ? 1 : 0, backgroundColor: pressed ? (isDark ? colors.navyMid : colors.surfaceAlt) : "transparent", flexDirection: rowDir },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if ('route' in item && item.route) {
                  router.push(item.route as any);
                }
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.gold + "15" }]}>
                <Feather name={item.icon as any} size={17} color={colors.gold} />
              </View>
              <View style={styles.menuLabel}>
                <Text style={[styles.menuTitle, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>{item.label}</Text>
                <Text style={[styles.menuSub, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>{item.sub}</Text>
              </View>
              <Feather name={isRTL ? "chevron-left" : "chevron-right"} size={16} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.signOut, { borderColor: colors.border, backgroundColor: colors.card, flexDirection: rowDir, opacity: pressed ? 0.75 : 1 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <Feather name="log-out" size={16} color="#ef4444" />
          <Text style={styles.signOutText}>{t.signOut}</Text>
        </Pressable>

        <Text style={[styles.version, { color: colors.mutedForeground }]}>{t.version}</Text>
      </View>
    </ScrollView>
  );
}

function ToggleCard({ icon, title, sub, active, onPress, colors, isRTL, rowDir, label }: any) {
  return (
    <View style={[styles.themeCard, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: rowDir }]}>
      <View style={[styles.themeLeft, { flexDirection: rowDir }]}>
        <View style={[styles.themeIcon, { backgroundColor: colors.gold + "18" }]}>
          {label ? (
            <Text style={{ color: colors.gold, fontSize: 14, fontWeight: "800" }}>{label}</Text>
          ) : (
            <Feather name={icon} size={18} color={colors.gold} />
          )}
        </View>
        <View>
          <Text style={[styles.themeTitle, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>{title}</Text>
          <Text style={[styles.themeSub, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>{sub}</Text>
        </View>
      </View>
      <Pressable
        style={[styles.themeSwitch, { backgroundColor: active ? colors.gold : colors.border }]}
        onPress={onPress}
        hitSlop={12}
      >
        <View style={[styles.thumbInner, { backgroundColor: "#fff", alignSelf: active ? "flex-end" : "flex-start" }]} />
      </Pressable>
    </View>
  );
}

function StatItem({ value, label, colors }: any) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: colors.gold }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerBg: { paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1 },
  avatarRow: { alignItems: "center", gap: 14, marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  avatarInitials: { fontSize: 22, fontWeight: "800" },
  avatarInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: "700", marginBottom: 5 },
  verifiedBadge: { alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1, alignSelf: "flex-start" },
  verifiedText: { fontSize: 12, fontWeight: "600" },
  editBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  statsStrip: { alignItems: "center", justifyContent: "space-around" },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 22, fontWeight: "800", marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: "500" },
  stripDivider: { width: 1, height: 32 },
  body: { padding: 20 },
  themeCard: { alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  themeLeft: { alignItems: "center", gap: 14 },
  themeIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  themeTitle: { fontSize: 14, fontWeight: "700", marginBottom: 1 },
  themeSub: { fontSize: 12 },
  themeSwitch: { width: 48, height: 28, borderRadius: 14, padding: 2, justifyContent: "center" },
  thumbInner: { width: 24, height: 24, borderRadius: 12 },
  sectionLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 1.5, marginBottom: 10, marginTop: 8 },
  menuCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginBottom: 20 },
  menuItem: { alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  menuIcon: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1 },
  menuTitle: { fontSize: 14, fontWeight: "600", marginBottom: 1 },
  menuSub: { fontSize: 12 },
  signOut: { alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 14, borderRadius: 12, borderWidth: 1, marginBottom: 24 },
  signOutText: { fontSize: 14, fontWeight: "600", color: "#ef4444" },
  version: { fontSize: 14, textAlign: "center" },
});
