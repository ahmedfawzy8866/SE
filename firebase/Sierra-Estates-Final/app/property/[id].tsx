import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { WebView } from "react-native-webview";

import { ContactModal } from "@/components/ContactModal";
import { VirtualTourModal } from "@/components/VirtualTourModal";
import { useFavorites } from "@/context/FavoritesContext";
import { PROPERTIES } from "@/data/properties";
import { useColors } from "@/hooks/useColors";

const { width: WINDOW_W } = Dimensions.get("window");
const SCREEN_W = Platform.OS === "web" ? Math.min(WINDOW_W, 480) : WINDOW_W;

function buildMiniMapHtml(lat: number, lng: number, title: string, isDark: boolean) {
  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
* { margin:0; padding:0; }
html,body,#map { width:100%; height:100%; }
.prop-marker { background:#040C16; color:#E9C176; border:2px solid #E9C176; border-radius:16px; padding:4px 10px; font-size:11px; font-weight:800; font-family:sans-serif; white-space:nowrap; }
</style>
</head>
<body>
<div id="map"></div>
<script>
var map = L.map('map',{zoomControl:false,attributionControl:false,dragging:false,scrollWheelZoom:false}).setView([${lat},${lng}],14);
L.tileLayer('${tileUrl}',{maxZoom:19}).addTo(map);
var el=document.createElement('div'); el.className='prop-marker'; el.innerText='${title.split(" ").slice(0, 2).join(" ")}';
L.marker([${lat},${lng}],{icon:L.divIcon({className:'',html:el,iconSize:null,iconAnchor:[40,16]})}).addTo(map);
</script>
</body>
</html>`;
}

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { isDark } = require("@/context/ThemeContext").useTheme();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [enquired, setEnquired] = useState(false);
  const [tourVisible, setTourVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  const property = PROPERTIES.find((p) => p.id === id);
  const fav = property ? isFavorite(property.id) : false;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!property) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: colors.text }}>Property not found</Text>
      </View>
    );
  }

  function onEnquire() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setContactVisible(true);
  }

  function handleContactSubmit() {
    setContactVisible(false);
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEnquired(true);
    }, 400);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.absoluteBar, { top: topPad }]}>
        <Pressable style={[styles.circleBtn, { backgroundColor: "rgba(4,12,22,0.75)" }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>
        <View style={styles.barRight}>
          <Pressable
            style={[styles.circleBtn, { backgroundColor: "rgba(4,12,22,0.75)" }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <Feather name="share-2" size={18} color="#fff" />
          </Pressable>
          <Pressable
            style={[styles.circleBtn, { backgroundColor: "rgba(4,12,22,0.75)" }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleFavorite(property.id); }}
          >
            <Feather name="heart" size={18} color={fav ? colors.gold : "#fff"} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: botPad + 100 }}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.heroWrap}>
          <Image source={property.image} style={styles.heroImage} />

          {property.isOffPlan && (
            <View style={styles.offPlanRow}>
              <View style={[styles.offPlanPill, { backgroundColor: "rgba(4,12,22,0.85)" }]}>
                <Text style={styles.offPlanText}>Off-Plan</Text>
              </View>
              {property.deliveryDate && (
                <View style={[styles.offPlanPill, { backgroundColor: "rgba(4,12,22,0.85)" }]}>
                  <Text style={styles.offPlanText}>Delivery Date: {property.deliveryDate}</Text>
                </View>
              )}
            </View>
          )}

          <Pressable
            style={[styles.tourBtn, { backgroundColor: colors.gold }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setTourVisible(true); }}
          >
            <Feather name="camera" size={15} color={colors.navyDeep} />
            <Text style={[styles.tourBtnText, { color: colors.navyDeep }]}>Virtual Tour</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(500)} style={[styles.scoreBar, { backgroundColor: isDark ? colors.navyMid : colors.surfaceAlt }]}>
          <View style={styles.scoreLeft}>
            <Feather name="cpu" size={14} color={colors.gold} />
            <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>AI Score</Text>
            <Text style={[styles.scoreValue, { color: colors.gold }]}>{property.aiScore}/100</Text>
          </View>
          <View style={[styles.scoreDivider, { backgroundColor: colors.border }]} />
          <View style={styles.scoreLeft}>
            <Feather name="trending-up" size={14} color={colors.gold} />
            <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>Yield</Text>
            <Text style={[styles.scoreValue, { color: colors.gold }]}>{property.yieldPercent}% p.a.</Text>
          </View>
          <View style={[styles.scoreDivider, { backgroundColor: colors.border }]} />
          <View style={styles.scoreLeft}>
            <Feather name="layers" size={14} color={colors.mutedForeground} />
            <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>Type</Text>
            <Text style={[styles.scoreValueAlt, { color: colors.text }]} numberOfLines={1}>{property.type.charAt(0).toUpperCase() + property.type.slice(1)}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.body}>
          <View style={styles.titleBlock}>
            <Text style={[styles.price, { color: colors.gold }]}>{property.priceLabel}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{property.title}</Text>
            <View style={styles.locRow}>
              <Feather name="map-pin" size={13} color={colors.mutedForeground} />
              <Text style={[styles.location, { color: colors.mutedForeground }]}>
                {property.location}, {property.city}
              </Text>
            </View>
          </View>

          <View style={styles.tags}>
            {property.tags.map((t, i) => (
              <View key={i} style={[styles.tag, { backgroundColor: colors.gold + "18", borderColor: colors.gold + "40" }]}>
                <Text style={[styles.tagText, { color: colors.gold }]}>{t}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.keyMetrics, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Metric label="Beds" value={`${property.beds}`} icon="home" colors={colors} />
            <Metric label="Baths" value={`${property.baths}`} icon="droplet" colors={colors} />
            <Metric label="Size" value={`${(property.sqft / 1000).toFixed(1)}k ft²`} icon="maximize" colors={colors} />
            <Metric label="Yield" value={`${property.yieldPercent}%`} icon="trending-up" colors={colors} highlight />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>About This Property</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>{property.description}</Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Features</Text>
          <View style={styles.features}>
            {property.features.map((f, i) => (
              <View key={i} style={[styles.featureChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="check" size={12} color={colors.gold} />
                <Text style={[styles.featureText, { color: colors.text }]}>{f}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={[styles.compoundInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="layers" size={18} color={colors.gold} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.compoundLabel, { color: colors.mutedForeground }]}>Compound / Development</Text>
              <Text style={[styles.compoundName, { color: colors.text }]}>{property.compound}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border, marginTop: 20 }]} />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Location & Neighbourhood</Text>
          <View style={[styles.mapContainer, { borderColor: colors.border }]}>
            <WebView
              source={{ html: buildMiniMapHtml(property.lat, property.lng, property.title, isDark) }}
              style={styles.miniMap}
              javaScriptEnabled
              scrollEnabled={false}
              pointerEvents="none"
            />
            <Pressable
              style={[styles.openMapBtn, { backgroundColor: colors.gold }]}
              onPress={() => router.push("/map" as any)}
            >
              <Feather name="map" size={13} color={colors.navyDeep} />
              <Text style={[styles.openMapBtnText, { color: colors.navyDeep }]}>Open Full Map</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: botPad + 8 }]}>
        {enquired ? (
          <View style={[styles.enquiredState, { backgroundColor: colors.gold + "20", borderColor: colors.gold + "44" }]}>
            <Feather name="check-circle" size={18} color={colors.gold} />
            <Text style={[styles.enquiredText, { color: colors.gold }]}>Advisor will contact you within 4s</Text>
          </View>
        ) : (
          <View style={styles.bottomActions}>
            <Pressable
              style={[styles.tourSmallBtn, { borderColor: colors.gold, backgroundColor: colors.gold + "15" }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTourVisible(true); }}
            >
              <Feather name="camera" size={16} color={colors.gold} />
              <Text style={[styles.tourSmallBtnText, { color: colors.gold }]}>Tour</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.enquireBtn, { backgroundColor: colors.gold, opacity: pressed ? 0.85 : 1, flex: 1 }]}
              onPress={onEnquire}
            >
              <Feather name="phone" size={16} color={colors.navyDeep} />
              <Text style={[styles.enquireBtnText, { color: colors.navyDeep }]}>Enquire Now</Text>
            </Pressable>
          </View>
        )}
      </View>

      <VirtualTourModal
        visible={tourVisible}
        onClose={() => setTourVisible(false)}
        propertyTitle={property.title}
        tourUrl={property.tourUrl}
      />

      <ContactModal
        visible={contactVisible}
        onClose={() => setContactVisible(false)}
        isRent={property.status === "rent"}
        propertyTitle={property.title}
        onSubmit={handleContactSubmit}
      />
    </View>
  );
}

function Metric({ label, value, icon, colors, highlight }: any) {
  return (
    <View style={styles.metric}>
      <Feather name={icon} size={16} color={highlight ? colors.gold : colors.mutedForeground} />
      <Text style={[styles.metricValue, { color: highlight ? colors.gold : colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  absoluteBar: { position: "absolute", zIndex: 100, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 12 },
  barRight: { flexDirection: "row", gap: 10 },
  circleBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  heroWrap: { position: "relative" },
  heroImage: { width: "100%", height: 300, resizeMode: "cover" },
  offPlanRow: { position: "absolute", top: 12, left: 12, flexDirection: "row", gap: 6 },
  offPlanPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 },
  offPlanText: { color: "#FAF8F5", fontSize: 12, fontWeight: "700" },
  tourBtn: {
    position: "absolute", bottom: 16, right: 16,
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  tourBtnText: { fontSize: 14, fontWeight: "800" },
  scoreBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-around",
    paddingVertical: 14, paddingHorizontal: 16,
  },
  scoreLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  scoreLabel: { fontSize: 12 },
  scoreValue: { fontSize: 14, fontWeight: "800" },
  scoreValueAlt: { fontSize: 14, fontWeight: "700" },
  scoreDivider: { width: 1, height: 24 },
  body: { padding: 20 },
  titleBlock: { marginBottom: 14 },
  price: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 6 },
  locRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  location: { fontSize: 14 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, borderWidth: 1 },
  tagText: { fontSize: 12, fontWeight: "600" },
  keyMetrics: { flexDirection: "row", borderRadius: 12, borderWidth: 1, overflow: "hidden", marginBottom: 24 },
  metric: { flex: 1, alignItems: "center", paddingVertical: 16, gap: 4 },
  metricValue: { fontSize: 14, fontWeight: "800" },
  metricLabel: { fontSize: 12, fontWeight: "500" },
  divider: { height: 1, marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: "800", marginBottom: 12 },
  description: { fontSize: 14, lineHeight: 21, marginBottom: 20 },
  features: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  featureChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  featureText: { fontSize: 14, fontWeight: "500" },
  mapContainer: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginBottom: 20, height: 200 },
  miniMap: { flex: 1 },
  openMapBtn: {
    position: "absolute", bottom: 12, right: 12,
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 6,
  },
  openMapBtnText: { fontSize: 14, fontWeight: "700" },
  compoundInfo: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 12, borderWidth: 1 },
  compoundLabel: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
  compoundName: { fontSize: 15, fontWeight: "700" },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  bottomActions: { flexDirection: "row", gap: 10 },
  tourSmallBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 15, borderRadius: 8, borderWidth: 1.5 },
  tourSmallBtnText: { fontSize: 14, fontWeight: "700" },
  enquireBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 15, borderRadius: 8 },
  enquireBtnText: { fontSize: 15, fontWeight: "800" },
  enquiredState: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 15, borderRadius: 8, borderWidth: 1 },
  enquiredText: { fontSize: 14, fontWeight: "600" },
});
