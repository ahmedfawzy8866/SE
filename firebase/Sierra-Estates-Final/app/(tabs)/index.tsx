import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
import {
  Animated as RNAnimated,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { WebView } from "react-native-webview";

import { ClaimNowModal } from "@/components/ClaimNowModal";
import { PropertyCard } from "@/components/PropertyCard";
import { SierraFooter } from "@/components/SierraFooter";
import { AIEngineSection } from "@/components/AIEngineSection";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { useClaim } from "@/context/ClaimContext";
import { FEATURES, PROPERTIES, STATS } from "@/data/properties";
import { useColors } from "@/hooks/useColors";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { VIRTUAL_TOUR_HTML } from "@/constants/VirtualTourHTML";
import { MAP_NODES } from "@/data/sierraData";

const isWeb = Platform.OS === "web";

function buildHomeMapHtml(isDark: boolean) {
  const bgColor = isDark ? "#0A1928" : "#EDF0F5";
  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
  const nodes = MAP_NODES.slice(0, 8);
  const nodesJson = JSON.stringify(nodes);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; background: ${bgColor}; overflow: hidden; }
#map { width: 100%; height: 100vh; }
.leaflet-div-icon { background: transparent; border: none; }
</style>
</head>
<body>
<div id="map"></div>
<script>
var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([30.04, 31.45], 11);
L.tileLayer('${tileUrl}', { maxZoom: 19 }).addTo(map);
L.control.zoom({ position: 'bottomright' }).addTo(map);
var gold = "#D3A747"; var dark = "#0C1422";
var nodes = ${nodesJson};
nodes.forEach(function(node) {
  var html = '<div style="display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;transform:translateX(-50%);transition:transform 0.2s;">' +
    '<div style="background:' + dark + ';border:2px solid ' + gold + ';color:#fff;padding:5px 13px;border-radius:22px;font-family:monospace;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,0.35);">' +
      node.units + ' <span style="font-size:9px;opacity:0.7">UNITS</span>' +
    '</div>' +
    '<div style="background:rgba(255,255,255,0.9);border:1px solid rgba(211,167,71,0.5);color:#002D62;padding:3px 10px;border-radius:8px;font-size:9px;font-weight:700;white-space:nowrap;">' +
      node.name +
    '</div>' +
    '<div style="width:8px;height:8px;background:' + gold + ';border-radius:50%;box-shadow:0 0 0 3px rgba(211,167,71,0.25);"></div>' +
  '</div>';
  var icon = L.divIcon({ className: '', html: html, iconSize: [0, 0], iconAnchor: [0, 60] });
  L.marker(node.coords, { icon: icon }).addTo(map);
});
</script>
</body>
</html>`;
}

const SCENES = [
  { 
    label: 'Exterior', 
    src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=90', 
    thumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=160&q=75',
    tagline: 'AI-DRIVEN EXCELLENCE',
    headlineParts: ['Smart Matches for ', 'Smart Investors', ''],
    subheadline: 'Our intelligence engine evaluates over 40 data points per property, filtering out the noise to present only the highest potential yield and lifestyle fits.'
  },
  { 
    label: 'Living',   
    src: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=90', 
    thumb: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=160&q=75',
    tagline: 'BEST-IN-CLASS DESIGN',
    headlineParts: ['Redefining ', 'Luxury Living', '\nwith AI-Driven Excellence'],
    subheadline: 'Experience the pinnacle of real estate innovation. Our platform provides unprecedented insights into high-end properties, ensuring you make informed decisions with confidence.'
  },
  { 
    label: 'Garden',   
    src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=90', 
    thumb: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=160&q=75',
    tagline: 'FIRST & ONLY WEBSITE IN EGYPT DESIGNED FOR NEW CAIRO',
    headlineParts: ['The First Exclusive Destination for New Cairo\nProperties. ', 'Rent & Resale.', ''],
    subheadline: 'We curate the finest opportunities across the New Cairo market. By combining advanced AI intelligence with an exclusive network of over 1,500 elite brokers across New Cairo, Madinaty, and El Shorouk, we deliver unmatched value tailored precisely to your needs.'
  },
  { 
    label: 'Pool',     
    src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=90', 
    thumb: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=160&q=75',
    tagline: 'EXCLUSIVE NETWORK',
    headlineParts: ['Unrivaled Access to ', 'Premium Compounds', ''],
    subheadline: "Gain entry to off-market listings and exclusive phases before they launch, backed by our strong relationships with Egypt's top developers."
  },
  { 
    label: 'Night',    
    src: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&q=90', 
    thumb: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=160&q=75',
    tagline: 'EGYPT REAL ESTATE',
    headlineParts: ['Secure Your Legacy in New Cairo', '', ''],
    subheadline: 'Invest in the most sought-after properties in Egypt. From exclusive villas to premium apartments, your next investment starts here.'
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const { isDark, toggleTheme } = useTheme();
  const { t, isRTL, toggleLanguage, language } = useLanguage();
  const { hasClaimed } = useClaim();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new RNAnimated.Value(0)).current;
  const [claimVisible, setClaimVisible] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const mapIframeRef = useRef<any>(null);
  const mapWebViewRef = useRef<any>(null);
  const tourIframeRef = useRef<any>(null);
  const tourWebViewRef = useRef<any>(null);
  const { isDesktop, isTablet, numColumns, contentMaxWidth } = useBreakpoint();

  const isWide = isDesktop || isTablet;
  const featured = PROPERTIES.filter((p) => p.isFeatured);
  const displayedFeatured = isWide ? PROPERTIES : featured;

  // Dynamic colors for Hero Overlay Section depending on light/dark mode
  const heroTextColor = isDark ? "#FAF8F5" : colors.navyDeep;
  const heroSubTextColor = isDark ? "rgba(250, 248, 245, 0.8)" : "rgba(13, 27, 54, 0.8)";
  const heroCtaSecondaryBorder = isDark ? "rgba(255,255,255,0.4)" : "rgba(13, 27, 54, 0.4)";
  const heroCtaSecondaryBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(13, 27, 54, 0.05)";
  const heroCtaSecondaryText = isDark ? "#FAF8F5" : colors.navyDeep;
  const heroCtaSecondaryIconColor = isDark ? "#FAF8F5" : colors.navyDeep;
  const statsLabelColor = isDark ? "rgba(250,248,245,0.55)" : "rgba(13, 27, 54, 0.65)";
  const heroBrandingTextColor = isDark ? "#FAF8F5" : colors.navyDeep;
  const heroBrandingIconColor = isDark ? "#FAF8F5" : colors.navyDeep;
  const scrollIndicatorTextColor = isDark ? colors.gold : colors.navyDeep;

  // Staggered Entrance Animations
  const fade1 = useRef(new RNAnimated.Value(0)).current;
  const fade2 = useRef(new RNAnimated.Value(0)).current;
  const fade3 = useRef(new RNAnimated.Value(0)).current;
  const slide1 = useRef(new RNAnimated.Value(20)).current;
  const slide2 = useRef(new RNAnimated.Value(20)).current;
  const slide3 = useRef(new RNAnimated.Value(20)).current;

  // BG Carousel State
  const [bgIdx, setBgIdx] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const bgOpacities = useRef(SCENES.map((_, i) => new RNAnimated.Value(i === 0 ? 0.6 : 0))).current;
  const bgScale = useRef(new RNAnimated.Value(1.0)).current;
  const pulseAnim = useRef(new RNAnimated.Value(1.0)).current;
  const scrollAnim = useRef(new RNAnimated.Value(0)).current;

  const scrollTranslateY = scrollAnim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0, 24, 24],
  });
  const scrollOpacity = scrollAnim.interpolate({
    inputRange: [0, 0.4, 0.8, 1],
    outputRange: [0, 0.8, 0.8, 0],
  });

  // Mount effects for loops and entrance stagger
  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';

    // 1. Entrance Stagger
    const entranceAnim = RNAnimated.stagger(150, [
      RNAnimated.parallel([
        RNAnimated.timing(fade1, { toValue: 1, duration: 800, useNativeDriver }),
        RNAnimated.timing(slide1, { toValue: 0, duration: 800, useNativeDriver })
      ]),
      RNAnimated.parallel([
        RNAnimated.timing(fade2, { toValue: 1, duration: 800, useNativeDriver }),
        RNAnimated.timing(slide2, { toValue: 0, duration: 800, useNativeDriver })
      ]),
      RNAnimated.parallel([
        RNAnimated.timing(fade3, { toValue: 1, duration: 800, useNativeDriver }),
        RNAnimated.timing(slide3, { toValue: 0, duration: 800, useNativeDriver })
      ])
    ]);
    entranceAnim.start();

    // 2. Background image cycling interval (if user hasn't interacted)
    const interval = setInterval(() => {
      if (!userInteracted) {
        setBgIdx((prev) => (prev + 1) % SCENES.length);
      }
    }, 6000);

    // 3. Continuous slow-pan zoom loop (35 seconds out and back)
    const bgScaleLoop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(bgScale, {
          toValue: 1.15,
          duration: 35000,
          useNativeDriver,
        }),
        RNAnimated.timing(bgScale, {
          toValue: 1.0,
          duration: 35000,
          useNativeDriver,
        })
      ])
    );
    bgScaleLoop.start();

    // 4. Pulse CTA button loop
    const pulseLoop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1250,
          useNativeDriver,
        }),
        RNAnimated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1250,
          useNativeDriver,
        })
      ])
    );
    pulseLoop.start();

    // 5. Scroll line indicator animation loop
    const scrollLoop = RNAnimated.loop(
      RNAnimated.timing(scrollAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver,
      })
    );
    scrollLoop.start();

    return () => {
      clearInterval(interval);
      entranceAnim.stop();
      bgScaleLoop.stop();
      pulseLoop.stop();
      scrollLoop.stop();
    };
  }, [userInteracted]);

  // Crossfade images when index changes
  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';
    const anims = SCENES.map((_, i) => {
      return RNAnimated.timing(bgOpacities[i], {
        toValue: i === bgIdx ? (isDark ? 0.7 : 0.9) : 0,
        duration: 800, // Faster crossfade for snappier UI response
        useNativeDriver,
      });
    });
    const parallelAnim = RNAnimated.parallel(anims);
    parallelAnim.start();

    return () => {
      parallelAnim.stop();
    };
  }, [bgIdx, isDark]);

  // On desktop/tablet the WebNav renders the sticky header — hide the in-page hero branding
  const showHeroBranding = !isWide;

  // On mobile web keep extra bottom padding for tab bar
  const bottomPadding = isWide
    ? 60
    : Platform.OS === "web"
    ? 34 + 84
    : 100;

  const topPad = isWide ? 0 : Platform.OS === "web" ? 0 : insets.top;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const parallaxHeroTranslateY = scrollY.interpolate({
    inputRange: [-100, 0, 500],
    outputRange: [0, 0, 150], // Moves image down as user scrolls down creating parallax depth
    extrapolate: "clamp",
  });

  const rowDir = isRTL ? "row-reverse" : "row";

  const handleSceneSelect = (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUserInteracted(true);
    setBgIdx(idx);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Sticky title — only on mobile (not wide web) */}
      {!isWide && (
        <Animated.View
          style={[
            styles.stickyHeader,
            {
              backgroundColor: colors.background,
              paddingTop: topPad,
              opacity: headerOpacity,
              borderBottomColor: colors.border,
            },
          ]}
          pointerEvents="box-none"
        >
          <Pressable onPress={() => router.push("/")} style={{ alignSelf: "center", alignItems: "center" }}>
            <Text style={[styles.stickyTitle, { color: colors.text }]}>
              {t.brandName}
            </Text>
            <Text style={{ fontSize: 6, fontWeight: '700', letterSpacing: 2, color: colors.gold, marginTop: 1 }}>
              FUTURE OF REAL ESTATES
            </Text>
          </Pressable>
        </Animated.View>
      )}

      <RNAnimated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        onScroll={RNAnimated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* ─── HERO ─── */}
        <View
          style={[
            styles.hero,
            isWide && styles.heroWide,
            { paddingTop: topPad + 20, position: "relative", backgroundColor: isDark ? "#000" : "#FFF", overflow: "hidden" },
          ]}
        >
          {/* Looping sliding background images with Parallax effect */}
          {SCENES.map((scene, i) => (
            <RNAnimated.Image
              key={scene.src}
              source={{ uri: scene.src }}
              style={[
                StyleSheet.absoluteFillObject,
                {
                  opacity: bgOpacities[i],
                  transform: [
                    { scale: bgScale },
                    { translateY: parallaxHeroTranslateY },
                    {
                      translateX: bgScale.interpolate({
                        inputRange: [1.0, 1.15],
                        outputRange: [0, -15],
                      }),
                    },
                  ],
                },
              ]}
              resizeMode="cover"
            />
          ))}

          {/* Cinematic Overlay Gradient (Adapts to Light/Dark) */}
          <LinearGradient
            colors={
              isDark
                ? ["rgba(0,13,32,0.65)", "rgba(0,26,54,0.45)", "#040C16"]
                : ["rgba(255,255,255,0.4)", "rgba(255,255,255,0.1)", colors.background]
            }
            locations={[0, 0.45, 1.0]}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Gold Accent Line bottom */}
          <LinearGradient
            colors={["transparent", "rgba(233, 193, 118, 0.4)", "rgba(233, 193, 118, 0.8)", "rgba(233, 193, 118, 0.4)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 1,
              zIndex: 5,
            }}
          />

          {/* Logo row — only on mobile */}
          {showHeroBranding && (
            <View
              style={[
                styles.heroBranding,
                { paddingTop: topPad, flexDirection: rowDir },
              ]}
            >
              <Pressable style={[styles.logoRow, { flexDirection: rowDir }]} onPress={() => router.push("/")}>
                <Image
                  source={require("../../assets/images/logo_shield.png")}
                  style={styles.logo}
                />
                <View>
                  <Text style={[styles.brandName, { color: heroBrandingTextColor }]}>{t.brandName}</Text>
                  <Text style={{ fontSize: 7, fontWeight: '700', letterSpacing: 2, color: colors.gold, marginTop: 2, textShadowColor: "rgba(0,0,0,0.15)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
                    FUTURE OF REAL ESTATES
                  </Text>
                </View>
              </Pressable>
              <View style={[styles.topActions, { flexDirection: rowDir }]}>
                <Pressable
                  style={[
                    styles.topBtn,
                    {
                      backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(13, 27, 54, 0.08)",
                      borderColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(13, 27, 54, 0.15)",
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleLanguage();
                  }}
                >
                  <Text style={[styles.langBtnText, { color: heroBrandingTextColor }]}>
                    {language === "en" ? "ع" : "EN"}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.topBtn,
                    {
                      backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(13, 27, 54, 0.08)",
                      borderColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(13, 27, 54, 0.15)",
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleTheme();
                  }}
                >
                  <Feather
                    name={isDark ? "sun" : "moon"}
                    size={16}
                    color={heroBrandingIconColor}
                  />
                </Pressable>
              </View>
            </View>
          )}

          {/* Hero content */}
          <View
            style={[
              styles.heroContent,
              isWide && styles.heroContentWide,
              isWide && { maxWidth: contentMaxWidth as any },
            ]}
          >
            <Pressable
              style={[
                styles.promoBar,
                {
                  backgroundColor: "rgba(4,12,22,0.75)",
                  flexDirection: rowDir,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setClaimVisible(true);
              }}
            >
              <View
                style={[
                  styles.promoBadge,
                  { backgroundColor: colors.gold },
                ]}
              >
                <Text
                  style={[styles.promoLabel, { color: colors.navyDeep }]}
                >
                  {t.promoOff}
                </Text>
              </View>
              <Text style={styles.promoText}>{t.promoService}</Text>
              <Text style={[styles.promoSpots, { color: colors.gold }]}>
                {t.promoSpots}
              </Text>
            </Pressable>

            <RNAnimated.View style={{ opacity: fade1, transform: [{ translateY: slide1 }] }}>
              <View style={[styles.pill, { flexDirection: rowDir, alignSelf: isWide ? "center" : "flex-start", marginBottom: 20 }]}>
                <View style={[styles.dot, { backgroundColor: colors.gold }]} />
                <Text style={[styles.pillText, { color: colors.gold }]}>
                  {SCENES[bgIdx].tagline}
                </Text>
              </View>
            </RNAnimated.View>
            
            <RNAnimated.View style={{ opacity: fade2, transform: [{ translateY: slide2 }] }}>
              <Text
                style={[
                  styles.heroHeadline,
                  isWide && styles.heroHeadlineWide,
                  { textAlign: isWide ? "center" : (isRTL ? "right" : "left"), color: heroTextColor },
                ]}
              >
                {SCENES[bgIdx].headlineParts[0]}
                {SCENES[bgIdx].headlineParts[1] ? (
                  <Text
                    style={[
                      styles.heroItalicGold,
                      SCENES[bgIdx].label === 'Garden' && {
                        textShadowColor: "rgba(233, 193, 118, 0.35)",
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 8,
                      },
                    ]}
                  >
                    {SCENES[bgIdx].headlineParts[1]}
                  </Text>
                ) : null}
                {SCENES[bgIdx].headlineParts[2]}
              </Text>
              <Text
                style={[
                  styles.heroSub,
                  isWide && styles.heroSubWide,
                  { textAlign: isWide ? "center" : (isRTL ? "right" : "left"), marginBottom: 30, color: heroSubTextColor },
                ]}
              >
                {SCENES[bgIdx].subheadline}
              </Text>
            </RNAnimated.View>

            <RNAnimated.View style={[styles.heroCtas, { flexDirection: rowDir, justifyContent: isWide ? "center" : "flex-start", opacity: fade3, transform: [{ translateY: slide3 }] }]}>
              <RNAnimated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Pressable
                  style={({ pressed }) => [
                    styles.ctaPrimary,
                    { backgroundColor: colors.gold, opacity: pressed ? 0.85 : 1 },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push("/listings" as any);
                  }}
                >
                  <Text
                    style={[
                      styles.ctaPrimaryText,
                      { color: colors.navyDeep },
                    ]}
                  >
                    {t.exploreListings}
                  </Text>
                  <Feather
                    name={isRTL ? "arrow-left" : "arrow-right"}
                    size={16}
                    color={colors.navyDeep}
                  />
                </Pressable>
              </RNAnimated.View>
              <Pressable
                style={({ pressed }) => [
                  styles.ctaSecondary,
                  {
                    borderColor: heroCtaSecondaryBorder,
                    flexDirection: rowDir,
                    opacity: pressed ? 0.75 : 1,
                    backgroundColor: heroCtaSecondaryBg
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/map" as any);
                }}
              >
                <Feather name="map" size={14} color={heroCtaSecondaryIconColor} />
                <Text style={[styles.ctaSecondaryText, { color: heroCtaSecondaryText }]}>{t.viewMap}</Text>
              </Pressable>
            </RNAnimated.View>

            <RNAnimated.View style={[{ opacity: fade3, transform: [{ translateY: slide3 }], marginTop: 24, width: isWide ? "60%" : "100%", alignSelf: "center" }]}>
              <View style={[styles.aiSearchContainer, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(13, 27, 54, 0.05)", borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(13, 27, 54, 0.1)" }]}>
                <Feather name="search" size={20} color={heroTextColor} style={{ marginLeft: 16 }} />
                <TextInput
                  style={[styles.aiSearchInput, { color: heroTextColor }]}
                  placeholder="Ask AI: e.g. 'Villa with pool under 10M'"
                  placeholderTextColor={heroSubTextColor}
                  value={aiQuery}
                  onChangeText={setAiQuery}
                  onSubmitEditing={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    if (aiQuery.trim()) {
                      router.push(`/listings?search=${encodeURIComponent(aiQuery)}&ai=true` as any);
                    }
                  }}
                  returnKeyType="search"
                />
                <Pressable 
                  style={[styles.aiSearchBtn, { backgroundColor: colors.gold }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    if (aiQuery.trim()) {
                      router.push(`/listings?search=${encodeURIComponent(aiQuery)}&ai=true` as any);
                    }
                  }}
                >
                  <Text style={[styles.aiSearchBtnText, { color: colors.navyDeep }]}>Match</Text>
                </Pressable>
              </View>
            </RNAnimated.View>

          </View>

          {/* Scene Selector Thumbnails */}
          <RNAnimated.View style={[styles.sceneSelector, { opacity: fade3 }]}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}
            >
              {SCENES.map((scene, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleSceneSelect(i)}
                  style={[
                    styles.sceneThumbWrapper,
                    bgIdx === i ? styles.sceneThumbActive : styles.sceneThumbInactive
                  ]}
                >
                  <Image source={{ uri: scene.thumb }} style={styles.sceneThumbImage} />
                </Pressable>
              ))}
            </ScrollView>
          </RNAnimated.View>

          {/* Stats bar */}
          <View style={[styles.statsContainer, isWide && styles.statsContainerWide]}>
            <BlurView
              intensity={Platform.OS === "ios" ? 30 : 15}
              tint={isDark ? "dark" : "light"}
              style={[
                styles.statsBlur,
                {
                  borderColor: isDark ? "rgba(233, 193, 118, 0.22)" : "rgba(196, 154, 60, 0.3)",
                  borderWidth: 1,
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: isDark ? "rgba(4, 20, 38, 0.4)" : "rgba(253, 251, 250, 0.6)",
                }
              ]}
            >
              <View style={[styles.statsRow, { flexDirection: rowDir }]}>
                {[
                  { value: "1,500+", label: t.luxuryListings },
                  { value: "26", label: t.compounds },
                  { value: "8yr", label: language === "ar" ? "بيانات السوق" : "Market Data" },
                  { value: "98%", label: language === "ar" ? "دقة الذكاء الاصطناعي" : "AI Accuracy" },
                ].map((s, i) => (
                  <View
                    key={i}
                    style={[
                      styles.statItem,
                      i < 3 && {
                        borderEndColor: isDark ? "rgba(233,193,118,0.12)" : "rgba(196,154,60,0.12)",
                        borderEndWidth: 1,
                      },
                    ]}
                  >
                    <Text style={[styles.statValue, { color: colors.gold }]}>
                      {s.value}
                    </Text>
                    <Text style={[styles.statLabel, { textAlign: "center", color: statsLabelColor }]}>
                      {s.label.toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </View>

          {/* Scroll Indicator */}
          <View style={styles.scrollIndicator}>
            <RNAnimated.View
              style={{
                transform: [{ translateY: scrollTranslateY }],
                opacity: scrollOpacity,
              }}
            >
              <LinearGradient
                colors={["rgba(233, 193, 118, 0.8)", "transparent"]}
                style={styles.scrollLine}
              />
            </RNAnimated.View>
            <Text style={[styles.scrollText, { color: scrollIndicatorTextColor }]}>
              {language === "ar" ? "اسحب لأسفل" : "SCROLL"}
            </Text>
          </View>
        </View>

        {/* ─── QUICK ACTIONS (mobile only) ─── */}
        {!isWide && (
          <View
            style={[
              styles.quickActions,
              {
                backgroundColor: colors.background,
                borderBottomColor: colors.border,
                flexDirection: rowDir,
              },
            ]}
          >
            <QuickAction
              icon="search"
              label={t.search}
              color={colors}
              onPress={() => router.push("/listings" as any)}
            />
            <QuickAction
              icon="map"
              label={t.mapView}
              color={colors}
              onPress={() => router.push("/map" as any)}
            />
            <QuickAction
              icon="camera"
              label={t.virtualTour}
              color={colors}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // We scroll down to the virtual tour section instead of opening a modal
                // Assuming Virtual Tour is further down the page
              }}
            />
            <QuickAction
              icon="tag"
              label={
                hasClaimed
                  ? isRTL
                    ? "✓ محجوز"
                    : "✓ Claimed"
                  : isRTL
                  ? "احجز 25%"
                  : "Claim 25%"
              }
              color={colors}
              onPress={() => setClaimVisible(true)}
              gold={!hasClaimed}
            />
          </View>
        )}

        {/* ─── FEATURED PROPERTIES ─── */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.background },
            isWide && styles.sectionWide,
            isWide && { maxWidth: contentMaxWidth as any },
          ]}
        >
          <SectionHeader
            title={t.featuredProperties}
            subtitle={t.featuredSub}
            colors={colors}
            isRTL={isRTL}
          />

          {isWide ? (
            // Desktop/tablet: multi-column grid
            <View
              style={[
                styles.propertyGrid,
                { flexDirection: rowDir, flexWrap: "wrap" },
              ]}
            >
              {displayedFeatured.map((p) => (
                <View
                  key={p.id}
                  style={[
                    styles.gridCell,
                    {
                      width: numColumns === 3 ? "32%" : "48%",
                    },
                  ]}
                >
                  <PropertyCard property={p} />
                </View>
              ))}
            </View>
          ) : (
            // Mobile: single column stack
            <>
              {featured.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.seeAllBtn,
              {
                borderColor: colors.border,
                flexDirection: rowDir,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => router.push("/listings" as any)}
          >
            <Text style={[styles.seeAllText, { color: colors.gold }]}>
              {t.seeAll} {PROPERTIES.length} {t.properties}
            </Text>
            <Feather
              name={isRTL ? "arrow-left" : "arrow-right"}
              size={14}
              color={colors.gold}
            />
          </Pressable>
        </View>

        {/* ─── INTERACTIVE MAP (EMBEDDED) ─── */}
        <View style={[styles.embeddedSection, { backgroundColor: colors.background }]}>
          <View style={[styles.embeddedHeader, { flexDirection: rowDir }]}>
            <View style={{ flex: 1 }}>
              <View style={[styles.embeddedKicker, { flexDirection: rowDir }]}>
                <View style={[styles.embeddedDot, { backgroundColor: colors.gold }]} />
                <Text style={[styles.embeddedKickerText, { color: colors.gold }]}>INTELLIGENCE MAP GRID</Text>
              </View>
              <Text style={[styles.embeddedTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {isRTL ? 'خريطة المشاريع التفاعلية' : 'Interactive Compounds Map'}
              </Text>
              <Text style={[styles.embeddedSub, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>
                {isRTL ? 'استعرض كمبوندات التجمع الخامس ومدينتي وأبتاون كايرو جغرافياً في الوقت الفعلي.' : 'Explore New Cairo, Madinaty & Uptown Cairo compounds geographically in real-time.'}
              </Text>
            </View>
            <Pressable
              style={[styles.embeddedOpenBtn, { borderColor: colors.gold + '60', backgroundColor: colors.gold + '12' }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/map' as any);
              }}
            >
              <Feather name="maximize-2" size={14} color={colors.gold} />
              <Text style={[styles.embeddedOpenBtnText, { color: colors.gold }]}>
                {isRTL ? 'فتح كاملاً' : 'Full Map'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.embeddedMapContainer, { borderColor: colors.border, borderRadius: 16, overflow: 'hidden' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/map' as any);
            }}
          >
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              {isWeb ? (
                <iframe
                  ref={mapIframeRef}
                  srcDoc={buildHomeMapHtml(isDark)}
                  style={{ width: '100%', height: '100%', border: 'none' } as any}
                  title="Sierra Intelligence Map"
                />
              ) : (
                <WebView
                  ref={mapWebViewRef}
                  source={{ html: buildHomeMapHtml(isDark) }}
                  style={{ flex: 1, borderRadius: 16 }}
                  javaScriptEnabled
                  scrollEnabled={false}
                />
              )}
            </View>
          </Pressable>
        </View>

        {/* ─── VIRTUAL TOUR (EMBEDDED) ─── */}
        <View style={[styles.embeddedSection, { backgroundColor: isDark ? colors.navyMid : colors.surfaceAlt }]}>
          <View style={[styles.embeddedHeader, { flexDirection: rowDir }]}>
            <View style={{ flex: 1 }}>
              <View style={[styles.embeddedKicker, { flexDirection: rowDir }]}>
                <View style={[styles.embeddedDot, { backgroundColor: colors.gold }]} />
                <Text style={[styles.embeddedKickerText, { color: colors.gold }]}>360° VIRTUAL EXPERIENCE</Text>
              </View>
              <Text style={[styles.embeddedTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {isRTL ? 'جولة افتراضية بزاوية 360°' : 'Immersive 360° Virtual Tour'}
              </Text>
              <Text style={[styles.embeddedSub, { color: colors.mutedForeground, textAlign: isRTL ? 'right' : 'left' }]}>
                {isRTL ? 'استكشف الوحدات الفاخرة بجودة ثلاثية الأبعاد قبل الزيارة الميدانية.' : 'Step inside premium units in full 3D before your site visit. VR-ready experience.'}
              </Text>
            </View>
            <Pressable
              style={[styles.embeddedOpenBtn, { borderColor: colors.gold + '60', backgroundColor: colors.gold + '12' }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Could expand fullscreen or navigate
              }}
            >
              <Feather name="maximize-2" size={14} color={colors.gold} />
              <Text style={[styles.embeddedOpenBtnText, { color: colors.gold }]}>
                {isRTL ? 'استكشاف' : 'Explore'}
              </Text>
            </Pressable>
          </View>

          <View
            style={[
              styles.embeddedTourContainer,
              { borderColor: colors.border, borderRadius: 16, overflow: 'hidden', height: 420 }
            ]}
          >
            <View style={StyleSheet.absoluteFill} pointerEvents="auto">
              {isWeb ? (
                <iframe
                  ref={tourIframeRef}
                  srcDoc={VIRTUAL_TOUR_HTML}
                  style={{ width: '100%', height: '100%', border: 'none' } as any}
                  title="Sierra 360 Virtual Tour"
                  allow="vr, gyroscope, accelerometer, fullscreen"
                />
              ) : (
                <WebView
                  ref={tourWebViewRef}
                  source={{ html: VIRTUAL_TOUR_HTML }}
                  style={{ flex: 1, borderRadius: 16 }}
                  javaScriptEnabled
                  scrollEnabled={false}
                  allowsInlineMediaPlayback
                  allowFileAccess
                />
              )}
            </View>
          </View>
        </View>

        {/* ─── AI ENGINE ─── */}
        <AIEngineSection />

        <View
          style={[
            styles.featuresSection,
            {
              backgroundColor: isDark ? colors.navyMid : colors.surfaceAlt,
            },
            isWide && styles.sectionWide,
            isWide && { maxWidth: contentMaxWidth as any },
          ]}
        >
          <SectionHeader
            title={t.whySierra}
            subtitle={t.whySierraSub}
            colors={colors}
            isRTL={isRTL}
          />

          {/* ─── WHY SIERRA HIGHLIGHT CARD ─── */}
          <Animated.View entering={isWeb ? undefined : FadeInDown.delay(200).springify().damping(16)}>
            <View style={[
              styles.highlightCard, 
              { 
                backgroundColor: colors.navyDeep, 
                borderColor: colors.gold, 
                borderWidth: 1,
                shadowColor: colors.gold,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
              }
            ]}>
              <View style={[styles.highlightIconBg, { backgroundColor: colors.gold + '22' }]}>
                <Feather name="shield" size={32} color={colors.gold} />
              </View>
              <Text style={[styles.highlightCardTitle, { color: '#FFFFFF', textAlign: isRTL ? 'right' : 'left' }]}>
                {isRTL ? "مستقبل العقارات في مصر" : "The Future of Real Estate"}
              </Text>
              <Text style={[styles.highlightCardText, { color: 'rgba(255,255,255,0.8)', textAlign: isRTL ? 'right' : 'left' }]}>
                {isRTL ? (
                  <>
                    نحن نعتمد على الذكاء الاصطناعي المتقدم لتوفير أفضل الفرص في السوق. من خلال شراكاتنا الحصرية مع <Text style={{ color: colors.gold, fontWeight: 'bold' }}>أكثر من 500 شركة وساطة عقارية</Text> و <Text style={{ color: colors.gold, fontWeight: 'bold' }}>3,000+ مستشار عقاري مستقل</Text>، نضمن لك الوصول لأفضل الاستثمارات.
                  </>
                ) : (
                  <>
                    We leverage advanced AI to unlock the finest opportunities across the market. By exclusively aligning with <Text style={{ color: colors.gold, fontWeight: 'bold' }}>500+ elite real estate brokerages</Text> and <Text style={{ color: colors.gold, fontWeight: 'bold' }}>3,000+ independent consultants</Text>, we guarantee unparalleled access to premium investments.
                  </>
                )}
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={isWeb ? undefined : FadeInDown.delay(400).springify()} style={[styles.featuresGrid, { flexDirection: rowDir }]}>
            {FEATURES.map((f, i) => (
              <View
                key={i}
                style={[
                  styles.featureCard,
                  isWide && styles.featureCardWide,
                  {
                    backgroundColor: isDark
                      ? colors.navyDeep
                      : colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: colors.gold + "22" },
                  ]}
                >
                  <Feather
                    name={f.icon as any}
                    size={20}
                    color={colors.gold}
                  />
                </View>
                <Text
                  style={[
                    styles.featureTitle,
                    {
                      color: colors.text,
                      textAlign: isRTL ? "right" : "left",
                    },
                  ]}
                >
                  {f.title}
                </Text>
                <Text
                  style={[
                    styles.featureDesc,
                    {
                      color: colors.mutedForeground,
                      textAlign: isRTL ? "right" : "left",
                    },
                  ]}
                >
                  {f.description}
                </Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* ─── CLAIM CTA BANNER ─── */}
        <View
          style={[
            styles.ctaSection,
            {
              backgroundColor: isDark ? colors.navyMid : colors.surfaceAlt,
            },
          ]}
        >
          <View
            style={[
              styles.ctaCard,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                maxWidth: isWide ? 600 : ("100%" as any),
                alignSelf: "center" as any,
                width: "100%",
              },
            ]}
          >
            <Text style={[styles.ctaEyebrow, { color: colors.gold }]}>
              {t.limitedAccess}
            </Text>
            <Text style={[styles.ctaTitle, { color: colors.text }]}>
              {t.off25Title}
            </Text>
            <Text style={[styles.ctaSub, { color: colors.mutedForeground }]}>
              {t.off25Sub}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.ctaBtn,
                { backgroundColor: colors.gold, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setClaimVisible(true);
              }}
            >
              <Text
                style={[styles.ctaBtnText, { color: colors.navyDeep }]}
              >
                {t.claimNow}
              </Text>
            </Pressable>
          </View>
        </View>

        <SierraFooter />
      </RNAnimated.ScrollView>

      <ClaimNowModal
        visible={claimVisible}
        onClose={() => setClaimVisible(false)}
      />
    </View>
  );
}

function QuickAction({ icon, label, color, onPress, gold }: any) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickAction,
        { opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.quickActionIcon,
          {
            backgroundColor: gold ? color.gold + "25" : color.gold + "18",
            borderColor: gold ? color.gold + "60" : color.gold + "30",
            borderWidth: gold ? 1.5 : 1,
          },
        ]}
      >
        <Feather name={icon} size={20} color={color.gold} />
      </View>
      <Text
        style={[
          styles.quickActionLabel,
          { color: color.mutedForeground },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SectionHeader({ title, subtitle, colors, isRTL }: any) {
  return (
    <View
      style={[
        styles.sectionHeader,
        { alignItems: isRTL ? "flex-end" : "flex-start" },
      ]}
    >
      <Text
        style={[
          styles.sectionTitle,
          { color: colors.text, textAlign: isRTL ? "right" : "left" },
        ]}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={[
            styles.sectionSub,
            {
              color: colors.mutedForeground,
              textAlign: isRTL ? "right" : "left",
            },
          ]}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingBottom: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  stickyTitle: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  hero: { minHeight: 640, justifyContent: "space-between" },
  heroWide: { minHeight: 700 },
  heroBrandingTextColor: {
    fontFamily: "Inter-SemiBold",
  },
  aiSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    backdropFilter: "blur(10px)",
  },
  aiSearchInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    fontFamily: "Inter-Regular",
    fontSize: 16,
    outlineStyle: "none",
  },
  aiSearchBtn: {
    height: "100%",
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  aiSearchBtnText: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
  },
  heroBranding: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    zIndex: 10,
  },
  logoRow: { alignItems: "center", gap: 8 },
  logo: { width: 32, height: 32, borderRadius: 8 },
  brandName: {
    color: "#FAF8F5",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },
  topActions: { gap: 8 },
  topBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  langBtnText: { color: "#FAF8F5", fontSize: 14, fontWeight: "800" },
  heroContent: { padding: 24, zIndex: 10 },
  heroContentWide: {
    paddingHorizontal: 80,
    paddingVertical: 60,
    alignSelf: "center" as any,
    width: "100%",
  },
  promoBar: {
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(4,12,22,0.75)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
    flexWrap: "wrap",
    alignSelf: "flex-start" as any,
  },
  promoBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },
  promoLabel: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  promoText: { color: "#FAF8F5CC", fontSize: 12, flex: 1 },
  promoSpots: { fontSize: 12, fontWeight: "700" },
  pill: { alignItems: "center", gap: 8, marginBottom: 14 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 12, fontWeight: "700", letterSpacing: 2 },
  heroHeadline: {
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 48,
    color: "#FAF8F5",
    marginBottom: 14,
  },
  heroHeadlineWide: { fontSize: 64, lineHeight: 74 },
  heroItalicGold: {
    fontStyle: "italic",
    fontWeight: "500",
    color: "#E9C176",
  },
  heroSub: {
    fontSize: 14,
    lineHeight: 21,
    color: "#FAF8F5CC",
    marginBottom: 28,
  },
  heroSubWide: { fontSize: 16, lineHeight: 26, maxWidth: 560 },
  heroCtas: { gap: 12, flexWrap: "wrap" },
  ctaPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 8,
  },
  ctaPrimaryText: { fontSize: 15, fontWeight: "700" },
  ctaSecondary: {
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
  },
  ctaSecondaryText: { color: "#FAF8F5", fontSize: 15, fontWeight: "600" },
  sceneSelector: {
    marginVertical: 10,
    zIndex: 10,
  },
  sceneThumbWrapper: {
    width: 68,
    height: 44,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
  },
  sceneThumbActive: {
    borderColor: "#E9C176",
    shadowColor: "#E9C176",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  sceneThumbInactive: {
    borderColor: "rgba(255,255,255,0.15)",
  },
  sceneThumbImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  statsContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
    zIndex: 10,
  },
  statsContainerWide: {
    marginHorizontal: 80,
    marginBottom: 20,
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
  },
  statsBlur: {
    borderRadius: 16,
    backgroundColor: "rgba(4, 20, 38, 0.4)",
  },
  statsRow: {
    paddingVertical: 16,
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    color: "rgba(250,248,245,0.55)",
  },
  scrollIndicator: {
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    marginBottom: 16,
    opacity: 0.7,
    zIndex: 10,
  },
  scrollLine: {
    width: 1.5,
    height: 36,
    borderRadius: 1,
  },
  scrollText: {
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  quickActions: {
    justifyContent: "space-around",
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  quickAction: { alignItems: "center", gap: 8, flex: 1 },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  section: { padding: 20, paddingTop: 28 },
  sectionWide: {
    paddingHorizontal: 60,
    paddingTop: 48,
    width: "100%",
    alignSelf: "center" as any,
  },
  sectionHeader: { marginBottom: 18 },
  sectionTitle: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  sectionSub: { fontSize: 14 },
  propertyGrid: {
    gap: 16,
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  gridCell: {
    marginBottom: 8,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
    alignSelf: "center",
  },
  seeAllText: { fontSize: 14, fontWeight: "700" },
  highlightCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  highlightIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  highlightCardTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  highlightCardText: {
    fontSize: 15,
    lineHeight: 24,
  },
  featuresSection: { padding: 20, paddingTop: 28, paddingBottom: 28 },
  featuresGrid: { flexWrap: "wrap", gap: 12 },
  featureCard: {
    width: "47%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  featureCardWide: { width: "23%" },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: { fontSize: 14, fontWeight: "700" },
  featureDesc: { fontSize: 12, lineHeight: 17 },
  ctaSection: { padding: 20, paddingBottom: 20 },
  ctaCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 26,
    alignItems: "center",
  },
  ctaEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 10,
  },
  ctaTitle: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  ctaSub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  ctaBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 6 },
  ctaBtnText: { fontSize: 14, fontWeight: "800" },

  // Embedded Map & Virtual Tour Sections
  embeddedSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  embeddedHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  embeddedKicker: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  embeddedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  embeddedKickerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  embeddedTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  embeddedSub: {
    fontSize: 13,
    lineHeight: 19,
  },
  embeddedOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start' as const,
  },
  embeddedOpenBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  embeddedMapContainer: {
    height: 420,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden' as const,
  },
  embeddedTourContainer: {
    height: 480,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden' as const,
  },
});
