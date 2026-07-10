import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";

import { useColors } from "@/hooks/useColors";
import { VIRTUAL_TOUR_HTML } from "@/constants/VirtualTourHTML";

interface VirtualTourModalProps {
  visible: boolean;
  onClose: () => void;
  propertyTitle: string;
  tourUrl?: string;
}

const { width: WINDOW_W, height: SCREEN_H } = Dimensions.get("window");
const SCREEN_W = Platform.OS === "web" ? Math.min(WINDOW_W, 480) : WINDOW_W;

export function VirtualTourModal({ visible, onClose, propertyTitle, tourUrl }: VirtualTourModalProps) {
  const colors = useColors();
  const [loading, setLoading] = useState(true);

  // If tourUrl is provided (e.g. Momento360 embed URL), load it directly. 
  // Otherwise, fall back to the self-contained Pannellum 360 viewer.
  const source = tourUrl ? { uri: tourUrl } : { html: VIRTUAL_TOUR_HTML };

  const injectedJS = !tourUrl ? `
    document.querySelector('a[href="../Sierra Estates 1.0 Client Hub.html"].hdr-btn').onclick = function(e) {
      e.preventDefault();
      window.ReactNativeWebView.postMessage('close');
    };
    true;
  ` : '';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" statusBarTranslucent>
      <View style={[styles.root, { backgroundColor: '#000' }]}>
        <View style={[styles.header, { backgroundColor: 'rgba(4, 12, 22, 0.95)', borderBottomColor: 'rgba(255,255,255,0.1)', borderBottomWidth: 1 }]}>
          <View>
            <Text style={[styles.headerLabel, { color: colors.gold }]}>360° EXPERIENCE</Text>
            <Text style={[styles.headerTitle, { color: '#ffffff' }]} numberOfLines={1}>
              {propertyTitle || "Sierra Estates"}
            </Text>
          </View>
          <Pressable
            style={[styles.closeBtn, { borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.1)' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
            }}
          >
            <Feather name="x" size={20} color="#ffffff" />
          </Pressable>
        </View>

        <View style={styles.tourContainer}>
          {loading && (
            <View style={[styles.loader, { backgroundColor: '#000' }]}>
              <ActivityIndicator size="large" color={colors.gold} />
              <Text style={[styles.loaderText, { color: colors.mutedForeground }]}>Loading 360° Tour...</Text>
            </View>
          )}
          <WebView
            source={source}
            style={styles.webview}
            onLoadEnd={() => setLoading(false)}
            javaScriptEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            scrollEnabled={tourUrl ? true : false}
            injectedJavaScript={injectedJS || undefined}
            onMessage={(event) => {
              if (event.nativeEvent.data === 'close') {
                onClose();
              }
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 14,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 2, marginBottom: 3 },
  headerTitle: { fontSize: 16, fontWeight: "700", maxWidth: SCREEN_W - 100 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tourContainer: { flex: 1, position: "relative" },
  webview: { flex: 1, backgroundColor: "#040C16" },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    zIndex: 5,
  },
  loaderText: { fontSize: 14 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingVertical: 14,
    paddingBottom: Platform.OS === "ios" ? 34 : 14,
    borderTopWidth: 1,
  },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerHint: { fontSize: 14 },
});
