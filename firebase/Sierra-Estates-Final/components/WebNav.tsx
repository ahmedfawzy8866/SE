import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useClaim } from "@/context/ClaimContext";
import { ClaimNowModal } from "@/components/ClaimNowModal";
import { HeaderFilters } from "@/components/HeaderFilters";

const NAV_LINKS = [
  { label: "navHome", route: "/", icon: "home", match: "/" },
  { label: "navSearch", route: "/listings", icon: "search", match: "/listings" },
  { label: "navMap", route: "/map", icon: "map", match: "/map" },
  { label: "navSaved", route: "/favorites", icon: "heart", match: "/favorites" },
  { label: "navAccount", route: "/profile", icon: "user", match: "/profile" },
] as const;

interface WebNavProps {
  onClaimPress?: () => void;
}

export function WebNav({ onClaimPress }: WebNavProps) {
  const colors = useColors();
  const { t, isRTL, toggleLanguage, language } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { hasClaimed } = useClaim();
  const pathname = usePathname();
  const [claimVisible, setClaimVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const rowDir = isRTL ? "row-reverse" : "row";

  function handleClaim() {
    if (onClaimPress) onClaimPress();
    else setClaimVisible(true);
  }

  function isActive(link: typeof NAV_LINKS[number]) {
    if (link.match === "/") return pathname === "/" || pathname === "/index" || pathname.endsWith("/(tabs)");
    return pathname.includes(link.match);
  }

  return (
    <>
      <View
        style={[
          styles.nav,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            flexDirection: rowDir,
          },
        ]}
      >
        {pathname !== "/" && pathname !== "/index" && (
          <Pressable 
            style={[styles.backBtn, { marginRight: 16 }]} 
            onPress={() => router.back()}
          >
            <Feather name={isRTL ? "chevron-right" : "chevron-left"} size={24} color={colors.text} />
          </Pressable>
        )}
        <Pressable
          style={[styles.logoArea, { flexDirection: rowDir }]}
          onPress={() => router.push("/(tabs)/index" as any)}
        >
          <Image
            source={require("../assets/images/logo_shield.png")}
            style={styles.logo}
          />
          <View>
            <Text style={[styles.brandName, { color: colors.text }]}>
              {t.brandName}
            </Text>
            <Text style={{ fontSize: 7, fontWeight: '700', letterSpacing: 2, color: colors.gold, marginTop: 2 }}>
              FUTURE OF REAL ESTATES
            </Text>
          </View>
        </Pressable>

        {/* Desktop Search Filters */}
        <View style={[styles.navLinks, { flexDirection: rowDir }]}>
          <HeaderFilters />
        </View>

        {/* Right actions */}
        <View style={[styles.rightActions, { flexDirection: rowDir }]}>
          {/* Lang toggle */}
          <Pressable
            style={[
              styles.iconBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={toggleLanguage}
          >
            <Text style={[styles.langText, { color: colors.text }]}>
              {language === "en" ? "ع" : "EN"}
            </Text>
          </Pressable>

          {/* Theme toggle */}
          <Pressable
            style={[
              styles.iconBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={toggleTheme}
          >
            <Feather
              name={isDark ? "sun" : "moon"}
              size={16}
              color={colors.text}
            />
          </Pressable>

          {/* Claim CTA */}
          {!hasClaimed && (
            <Pressable
              style={({ pressed }) => [
                styles.claimBtn,
                {
                  backgroundColor: colors.gold,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              onPress={handleClaim}
            >
              <Text style={[styles.claimBtnText, { color: colors.navyDeep }]}>
                Claim 25% Off
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <ClaimNowModal
        visible={claimVisible}
        onClose={() => setClaimVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: Platform.OS === "web" ? ("sticky" as any) : "relative",
    top: 0,
    zIndex: 200,
    width: "100%",
    height: 72,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  logoArea: {
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  brandName: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
  },
  navLinks: {
    alignItems: "center",
    gap: 4,
    flex: 1,
    justifyContent: "center",
  },
  navLink: {
    paddingHorizontal: 14,
    paddingVertical: 20,
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: "600",
    paddingBottom: 2,
  },
  rightActions: {
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  langText: {
    fontSize: 14,
    fontWeight: "800",
  },
  claimBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  claimBtnText: {
    fontSize: 14,
    fontWeight: "800",
  },
});
