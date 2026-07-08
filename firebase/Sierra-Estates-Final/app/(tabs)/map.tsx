import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import Slider from "@react-native-community/slider";

import { MAP_NODES, MapNode } from "@/data/sierraData";
import { useColors } from "@/hooks/useColors";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { SierraFooter } from "@/components/SierraFooter";

const isWeb = Platform.OS === "web";

function buildMapHtml(isDark: boolean) {
  const bgColor = isDark ? "#0A1928" : "#EDF0F5";
  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

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

var markersLayer = L.layerGroup().addTo(map);
var currentMarkers = {};

function renderMarkers(nodes, activeNodeId) {
  markersLayer.clearLayers();
  currentMarkers = {};

  nodes.forEach(function(node) {
    var isActive = node.id === activeNodeId;
    var gold = "#D3A747";
    var dark = "#0C1422";
    
    var html = '<div style="display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;transform:translateX(-50%);' + (isActive ? 'scale:1.15;' : '') + 'transition:transform 0.2s;">' +
      '<div style="background:' + dark + ';border:2px solid ' + gold + ';color:#fff;padding:5px 13px;border-radius:22px;font-family:\\'JetBrains Mono\\',monospace;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,0.35);backdrop-filter:blur(8px);">' +
        node.units + ' <span style="font-size:9px;opacity:0.7">UNITS</span>' +
      '</div>' +
      '<div style="background:rgba(255,255,255,0.9);border:1px solid rgba(211,167,71,0.5);color:#002D62;padding:3px 10px;border-radius:8px;font-size:9px;font-weight:700;white-space:nowrap;">' +
        node.name +
      '</div>' +
      '<div style="width:8px;height:8px;background:' + gold + ';border-radius:50%;box-shadow:0 0 0 3px rgba(211,167,71,0.25);"></div>' +
    '</div>';

    var icon = L.divIcon({
      className: '',
      html: html,
      iconSize: [0, 0],
      iconAnchor: [0, 60]
    });

    var marker = L.marker(node.coords, { icon: icon }).addTo(markersLayer);
    currentMarkers[node.id] = marker;

    marker.on('click', function() {
      // Send message to React Native
      var msg = JSON.stringify({ type: 'NODE_CLICK', id: node.id });
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(msg);
      } else {
        window.parent.postMessage(msg, '*');
      }
    });
  });
}

function handleMessage(e) {
  try {
    var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
    if (data.type === 'SYNC') {
      renderMarkers(data.nodes, data.activeNodeId);
      if (data.activeNodeId && currentMarkers[data.activeNodeId]) {
        map.panTo(currentMarkers[data.activeNodeId].getLatLng(), { animate: true, duration: 0.8 });
      }
    }
  } catch(err) {}
}

window.addEventListener("message", handleMessage);
document.addEventListener("message", handleMessage); // For Android WebView
</script>
</body>
</html>`;
}

export default function MapScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isDesktop, isTablet } = useBreakpoint();
  const { isDark } = require("@/context/ThemeContext").useTheme();
  
  const isWide = isDesktop || isTablet;
  const topPad = isWide ? 0 : (isWeb ? 0 : insets.top);

  // Filter State
  const [txMode, setTxMode] = useState<"resale" | "rent">("resale");
  const [budgetVal, setBudgetVal] = useState(25000000);
  const [activeNode, setActiveNode] = useState<MapNode | null>(null);

  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Derived filtered nodes
  const filteredNodes = MAP_NODES.filter((n) => {
    if (txMode === "resale") {
      return n.priceNumeric <= budgetVal;
    }
    return true; // For rent, we show all for now or could implement rent budget
  });

  // Sync state to map engine
  useEffect(() => {
    const msg = JSON.stringify({
      type: "SYNC",
      nodes: filteredNodes,
      activeNodeId: activeNode?.id,
    });
    if (isWeb && iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(msg, "*");
    } else if (webViewRef.current) {
      webViewRef.current.postMessage(msg);
    }
  }, [filteredNodes, activeNode, isWeb]);

  function onMapMessage(event: any) {
    try {
      const data = isWeb ? event.data : JSON.parse(event.nativeEvent.data);
      if (data.type === "NODE_CLICK") {
        const node = MAP_NODES.find((n) => n.id === data.id);
        if (node) {
          setActiveNode(node);
          if (!isWeb) Haptics.selectionAsync();
        }
      }
    } catch (e) {}
  }

  // Handle iframe messages on Web
  useEffect(() => {
    if (isWeb) {
      window.addEventListener("message", onMapMessage);
      return () => window.removeEventListener("message", onMapMessage);
    }
  }, []);

  const themeColors = {
    bg: "#0A1928",
    border: "rgba(255,255,255,0.06)",
    gold: "#D3A747",
    goldGlow: "#E9C176",
    textMuted: "rgba(255,255,255,0.5)",
  };

  return (
    <ScrollView 
      style={[styles.root, { backgroundColor: colors.background, paddingTop: topPad }]} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: themeColors.gold }]}>
          BLOCK 06 · INTELLIGENCE MAP GRID
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>Real-Time Intelligence Map Grid</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Locked geographical tracking centered on 5th Settlement, Madinaty, and Uptown Cairo.
        </Text>
      </View>

      {/* Chassis */}
      <View style={[styles.chassis, { borderColor: themeColors.border, flexDirection: isWide ? "row" : "column", height: isWide ? 620 : "auto" }]}>
        
        {/* LEFT: Filter Panel */}
        <View style={[styles.leftPanel, { borderRightColor: isWide ? themeColors.border : "transparent", borderBottomColor: !isWide ? themeColors.border : "transparent", borderRightWidth: isWide ? 1 : 0, borderBottomWidth: !isWide ? 1 : 0 }]}>
          <Text style={[styles.panelLogo, { borderBottomColor: themeColors.border }]}>
            SIERRA MAP
          </Text>

          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: themeColors.gold }]}>TRANSACTION PROFILE</Text>
            <View style={styles.txRow}>
              {(["resale", "rent"] as const).map((mode) => {
                const on = txMode === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => setTxMode(mode)}
                    style={[
                      styles.txBtn,
                      {
                        backgroundColor: on ? themeColors.gold + "1A" : "transparent",
                        borderColor: on ? themeColors.gold : themeColors.border,
                      }
                    ]}
                  >
                    <Text style={[styles.txBtnText, { color: on ? themeColors.gold : themeColors.textMuted }]}>
                      {mode.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {txMode === "resale" && (
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: themeColors.gold }]}>MAX BUDGET CONSTRAINT</Text>
              {Platform.OS === "web" ? (
                <input
                  type="range"
                  min={1000000}
                  max={60000000}
                  step={500000}
                  value={budgetVal}
                  onChange={(e) => setBudgetVal(Number(e.target.value))}
                  style={{ width: "100%", accentColor: themeColors.gold, cursor: "pointer", height: 30 }}
                />
              ) : (
                <Slider
                  style={{ width: "100%", height: 30 }}
                  minimumValue={1000000}
                  maximumValue={60000000}
                  step={500000}
                  value={budgetVal}
                  onValueChange={setBudgetVal}
                  minimumTrackTintColor={themeColors.gold}
                  maximumTrackTintColor={themeColors.border}
                  thumbTintColor={themeColors.gold}
                />
              )}
              <Text style={[styles.budgetVal, { color: themeColors.goldGlow }]}>
                EGP {(budgetVal / 1000000).toFixed(1)}M
              </Text>
            </View>
          )}

          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: themeColors.gold }]}>ACTIVE ZONES</Text>
            {["5th Settlement", "New Cairo", "Madinaty", "Uptown Cairo", "New Capital"].map((zone) => (
              <View key={zone} style={styles.zoneRow}>
                <View style={[styles.zoneDot, { backgroundColor: themeColors.gold }]} />
                <Text style={[styles.zoneText, { color: themeColors.textMuted }]}>{zone}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CENTER: Map Engine */}
        <View style={[styles.centerPanel, { height: isWide ? "100%" : 450 }]}>
          {isWeb ? (
            <iframe
              ref={iframeRef}
              srcDoc={buildMapHtml(isDark)}
              style={{ width: "100%", height: "100%", border: "none" } as any}
              title="Intelligence Map"
              onLoad={() => {
                // Initial sync after load
                const msg = JSON.stringify({ type: "SYNC", nodes: filteredNodes, activeNodeId: activeNode?.id });
                iframeRef.current?.contentWindow?.postMessage(msg, "*");
              }}
            />
          ) : (
            <WebView
              ref={webViewRef}
              source={{ html: buildMapHtml(isDark) }}
              style={{ flex: 1 }}
              onMessage={onMapMessage}
              javaScriptEnabled
              scrollEnabled={false}
              onLoadEnd={() => {
                const msg = JSON.stringify({ type: "SYNC", nodes: filteredNodes, activeNodeId: activeNode?.id });
                webViewRef.current?.postMessage(msg);
              }}
            />
          )}
        </View>

        {/* RIGHT: Compounds Stream */}
        <View style={[styles.rightPanel, { height: isWide ? "100%" : 400, borderLeftColor: isWide ? themeColors.border : "transparent", borderTopColor: !isWide ? themeColors.border : "transparent", borderLeftWidth: isWide ? 1 : 0, borderTopWidth: !isWide ? 1 : 0 }]}>
          <View style={[styles.streamHeader, { backgroundColor: themeColors.bg, borderBottomColor: themeColors.border }]}>
            <Text style={[styles.streamLabel, { color: themeColors.gold }]}>COMPOUNDS</Text>
            <Text style={[styles.streamCount, { color: themeColors.textMuted }]}>{filteredNodes.length} ACTIVE</Text>
          </View>
          
          <ScrollView style={styles.streamList}>
            {filteredNodes.map((node) => {
              const isActive = activeNode?.id === node.id;
              return (
                <Pressable
                  key={node.id}
                  onPress={() => setActiveNode(node)}
                  style={[
                    styles.nodeItem,
                    {
                      borderBottomColor: themeColors.border,
                      backgroundColor: isActive ? themeColors.gold + "10" : "transparent"
                    }
                  ]}
                >
                  {isActive && <View style={[styles.nodeIndicator, { backgroundColor: themeColors.gold }]} />}
                  <View style={styles.nodeTop}>
                    <Text style={[styles.nodeName, { color: isActive ? themeColors.goldGlow : colors.text }]} numberOfLines={1}>
                      {node.name}
                    </Text>
                    <Text style={styles.nodeAi}>AI {node.ai}</Text>
                  </View>
                  <Text style={[styles.nodePrice, { color: themeColors.goldGlow }]}>
                    {txMode === "resale" ? node.priceResale : node.priceRent}
                  </Text>
                  <Text style={[styles.nodeSub, { color: themeColors.textMuted }]}>
                    {node.units} units · {node.zone}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

      </View>
      
      <View style={{ marginTop: 40 }}>
        <SierraFooter />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  contentContainer: { padding: 20 },
  header: { marginBottom: 24 },
  kicker: { fontSize: 12, fontFamily: Platform.OS === "web" ? "monospace" : "System", letterSpacing: 2, fontWeight: "700", marginBottom: 8 },
  title: { fontSize: 32, fontWeight: "800", marginBottom: 8 },
  subtitle: { fontSize: 14, maxWidth: 580 },
  chassis: { 
    borderWidth: 1, 
    borderRadius: 20, 
    overflow: "hidden", 
    backgroundColor: "#0A1928",
  },
  leftPanel: {
    width: Platform.OS === "web" ? 270 : "100%",
    padding: 20,
  },
  panelLogo: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 2,
    color: "rgba(211,167,71,0.6)",
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  filterSection: { marginBottom: 24 },
  filterLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 1.5, marginBottom: 10 },
  txRow: { flexDirection: "row", gap: 8 },
  txBtn: { flex: 1, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 22, borderWidth: 1 },
  txBtnText: { fontSize: 12, fontWeight: "700" },
  budgetVal: { fontSize: 14, fontFamily: Platform.OS === "web" ? "monospace" : "System", marginTop: 8 },
  zoneRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  zoneDot: { width: 8, height: 8, borderRadius: 4, shadowColor: "#D3A747", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 4 },
  zoneText: { fontSize: 14 },
  centerPanel: { flex: 1, position: "relative" },
  rightPanel: {
    width: Platform.OS === "web" ? 260 : "100%",
    flexDirection: "column",
  },
  streamHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
  },
  streamLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 1.5 },
  streamCount: { fontSize: 12, fontFamily: Platform.OS === "web" ? "monospace" : "System" },
  streamList: { flex: 1 },
  nodeItem: {
    padding: 14,
    borderBottomWidth: 1,
    minHeight: 80,
    justifyContent: "center",
    position: "relative",
  },
  nodeIndicator: { position: "absolute", left: 0, top: 0, bottom: 0, width: 2 },
  nodeTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 },
  nodeName: { fontSize: 14, fontWeight: "700", flex: 1, paddingRight: 8, lineHeight: 16 },
  nodeAi: { fontSize: 12, color: "#10B981", fontWeight: "700", fontFamily: Platform.OS === "web" ? "monospace" : "System" },
  nodePrice: { fontSize: 14, fontWeight: "700", marginBottom: 4, fontFamily: Platform.OS === "web" ? "monospace" : "System" },
  nodeSub: { fontSize: 12 },
});
