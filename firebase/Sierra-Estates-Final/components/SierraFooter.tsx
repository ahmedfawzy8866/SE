import React from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Platform, Linking } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/context/LanguageContext";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const LINKS = {
  Properties: ["Villas", "Apartments", "Penthouses", "Duplexes", "Twin Houses", "New Listings"],
  Compounds: ["Hyde Park", "Mountain View", "Mivida", "Villette", "SODIC East", "Palm Hills NC"],
  Company: ["About Sierra", "AI Engine", "Careers", "Press", "Partners", "Contact"],
  Legal: ["Privacy Policy", "Terms of Use", "Cookie Policy", "Compliance"],
};

export function SierraFooter() {
  const colors = useColors();
  const { t, language } = useLanguage();
  const { isDesktop, isTablet } = useBreakpoint();
  const isWide = isDesktop || isTablet;

  const handleLinkPress = (url: string) => {
    if (url === "Careers") {
      router.push("/careers" as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.navyDeep, borderTopColor: "rgba(233,193,118,0.1)" }]}>
      <View style={[styles.inner, isWide && styles.innerWide]}>
        
        {/* Top Grid */}
        <View style={[styles.grid, isWide && styles.gridWide]}>
          {/* Brand Info */}
          <View style={[styles.brandCol, isWide && { flex: 2 }]}>
            <View style={styles.logoRow}>
              <View style={[styles.logoBox, { backgroundColor: colors.gold }]}>
                <Text style={[styles.logoChar, { color: colors.navyDeep }]}>S</Text>
              </View>
              <View>
                <Text style={[styles.brandName, { color: colors.cream }]}>SIERRA</Text>
                <Text style={[styles.brandTag, { color: "rgba(255,255,255,0.25)" }]}>Future of Real Estates</Text>
              </View>
            </View>
            <Text style={[styles.brandDesc, { color: "rgba(255,255,255,0.35)" }]}>
              {language === "ar"
                ? "أول منصة ذكاء اصطناعي عقارية في القاهرة."
                : "Cairo's first AI-driven real estate intelligence platform, built exclusively for New Cairo's most discerning investors."}
            </Text>
            
            <View style={styles.contactList}>
              <View style={styles.contactItem}>
                <Feather name="phone" size={13} color="rgba(233,193,118,0.5)" />
                <Text style={[styles.contactText, { color: "rgba(255,255,255,0.35)" }]}>+20 100 123 4567</Text>
              </View>
              <View style={styles.contactItem}>
                <Feather name="mail" size={13} color="rgba(233,193,118,0.5)" />
                <Text style={[styles.contactText, { color: "rgba(255,255,255,0.35)" }]}>hello@sierra.com.eg</Text>
              </View>
              <View style={styles.contactItem}>
                <Feather name="map-pin" size={13} color="rgba(233,193,118,0.5)" />
                <Text style={[styles.contactText, { color: "rgba(255,255,255,0.35)" }]}>Hyde Park, 5th Settlement, Cairo</Text>
              </View>
            </View>
          </View>

          {/* Links */}
          {Object.entries(LINKS).map(([category, items]) => (
            <View key={category} style={[styles.linkCol, isWide && { flex: 1 }]}>
              <Text style={[styles.linkCatTitle, { color: colors.gold }]}>{category}</Text>
              <View style={styles.linkList}>
                {items.map((item) => (
                  <Pressable key={item} onPress={() => handleLinkPress(item)} hitSlop={8} style={{ paddingVertical: 4 }}>
                    <Text style={[styles.linkText, { color: "rgba(255,255,255,0.3)" }]}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Newsletter */}
        <View style={[styles.newsletterBox, { backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(233,193,118,0.1)", flexDirection: isWide ? "row" : "column" }]}>
          <View style={!isWide && { marginBottom: 16 }}>
            <Text style={[styles.newsletterTitle, { color: colors.cream }]}>{language === "ar" ? "اشترك في النشرة الإخبارية" : "Join the Inner Circle"}</Text>
            <Text style={[styles.newsletterSub, { color: "rgba(255,255,255,0.3)" }]}>
              {language === "ar" ? "احصل على تحليلات سوق العقارات حصرياً." : "Get exclusive real estate market insights."}
            </Text>
          </View>
          <View style={[styles.newsletterForm, isWide && { width: 360 }]}>
            <TextInput
              style={[styles.newsletterInput, { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }]}
              placeholder={language === "ar" ? "البريد الإلكتروني..." : "Email address..."}
              placeholderTextColor="rgba(255,255,255,0.2)"
            />
            <Pressable style={[styles.newsletterBtn, { backgroundColor: colors.gold }]}>
              <Text style={[styles.newsletterBtnText, { color: colors.navyDeep }]}>
                {language === "ar" ? "اشتراك" : "Subscribe"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Bottom Bar */}
        <View style={[styles.bottomBar, { borderTopColor: "rgba(255,255,255,0.05)", flexDirection: isWide ? "row" : "column-reverse" }]}>
          <Text style={[styles.copyright, { color: "rgba(255,255,255,0.2)" }]}>
            © {new Date().getFullYear()} Sierra Estates. All rights reserved.
          </Text>
          <View style={[styles.socialRow, !isWide && { marginBottom: 16 }]}>
            {["share-2", "message-circle", "external-link", "youtube"].map((iconName) => (
              <Pressable
                key={iconName}
                style={[styles.socialBtn, { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }]}
              >
                <Feather name={iconName as any} size={14} color="rgba(255,255,255,0.3)" />
              </Pressable>
            ))}
          </View>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    width: "100%",
  },
  inner: {
    width: "100%",
  },
  innerWide: {
    maxWidth: 1320,
    alignSelf: "center",
    paddingVertical: 20,
  },
  grid: {
    flexDirection: "column",
    gap: 32,
    marginBottom: 40,
  },
  gridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  brandCol: {
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoChar: {
    fontSize: 16,
    fontWeight: "700",
  },
  brandName: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  brandTag: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 2,
  },
  brandDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 260,
  },
  contactList: {
    gap: 10,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  contactText: {
    fontSize: 12,
  },
  linkCol: {
    width: "48%",
  },
  linkCatTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 16,
  },
  linkList: {
    gap: 12,
  },
  linkText: {
    fontSize: 12,
  },
  newsletterBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 40,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  newsletterTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  newsletterSub: {
    fontSize: 12,
    marginTop: 6,
  },
  newsletterForm: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  newsletterInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 44,
    fontSize: 14,
  },
  newsletterBtn: {
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  newsletterBtnText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  bottomBar: {
    borderTopWidth: 1,
    paddingTop: 32,
    alignItems: "center",
    justifyContent: "space-between",
  },
  copyright: {
    fontSize: 12,
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
