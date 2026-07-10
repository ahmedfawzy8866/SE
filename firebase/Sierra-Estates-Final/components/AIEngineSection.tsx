import React, { useRef, useEffect } from "react";
import { StyleSheet, Text, View, Dimensions, Platform, Pressable } from "react-native";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/context/LanguageContext";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const { width: WINDOW_W } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

const AVM_CHART_DATA = [
  { year: "20", val1: 4, val2: 10, val3: 16 },
  { year: "2021", val1: 4.5, val2: 12, val3: 18 },
  { year: "2022", val1: 4.8, val2: 14, val3: 20 },
  { year: "2023", val1: 5.8, val2: 16, val3: 22 }, 
  { year: "2024", val1: 6.5, val2: 18, val3: 24 },
  { year: "2025", val1: 7.0, val2: 20, val3: 26 },
];

const ROI_DATA = [
  { label: "Uptown Cairo", pct: "+31%", val: 0.9 },
  { label: "Mountain View", pct: "+24%", val: 0.7 },
  { label: "Hyde Park", pct: "+22%", val: 0.65 },
  { label: "Palm Hills", pct: "+21%", val: 0.62 },
  { label: "Villette", pct: "+20%", val: 0.58 },
];

function GlowingLineChart() {
  const chartHeight = 150;
  const chartWidth = 400; // SVGs will stretch via viewBox
  
  const createPath = (key: 'val1'|'val2'|'val3') => {
    return AVM_CHART_DATA.map((d, i) => {
      const x = (i / (AVM_CHART_DATA.length - 1)) * chartWidth;
      const y = chartHeight - (d[key] / 30) * chartHeight;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const path1 = createPath('val1'); // Mivida (bottom)
  const path2 = createPath('val2'); // Mountain View (mid)
  const path3 = createPath('val3'); // Hyde park (top, gold)

  const pts = AVM_CHART_DATA.map((d, i) => ({
    x: (i / (AVM_CHART_DATA.length - 1)) * chartWidth,
    y: chartHeight - (d.val3 / 30) * chartHeight
  }));

  return (
    <View style={{ width: '100%', height: 200, marginTop: 20 }}>
      <Svg width="100%" height="160" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
        <Defs>
          <SvgGradient id="glow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#E9C176" stopOpacity="0.4" />
            <Stop offset="1" stopColor="#E9C176" stopOpacity="0" />
          </SvgGradient>
        </Defs>
        
        {/* Background gradient under top line */}
        <Path d={`${path3} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`} fill="url(#glow)" />
        
        {/* Lines */}
        <Path d={path1} stroke="#4ECDC4" strokeWidth="2" fill="none" opacity={0.6} />
        <Path d={path2} stroke="#3B82F6" strokeWidth="2" fill="none" opacity={0.6} />
        
        {/* Gold Glowing Line */}
        <Path d={path3} stroke="#E9C176" strokeWidth="3" fill="none" />
        <Path d={path3} stroke="#E9C176" strokeWidth="6" fill="none" opacity={0.3} />

        {/* Glow dots for top line */}
        {pts.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r="4" fill="#E9C176" />
        ))}
      </Svg>
      
      {/* X Axis Labels */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 10 }}>
        {AVM_CHART_DATA.map((d, i) => (
          <Text key={i} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>{d.year}</Text>
        ))}
      </View>
    </View>
  );
}

function ROIPanel() {
  return (
    <View style={styles.roiPanel}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 }} />
        <Text style={styles.panelEyebrow}>ROI COMPOUNDING YIELD</Text>
      </View>

      <View style={{ gap: 18 }}>
        {ROI_DATA.map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: '#FFF', width: 100, fontSize: 14, fontWeight: '500' }}>{item.label}</Text>
            <View style={{ flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, marginHorizontal: 16 }}>
              <View 
                style={{ 
                  width: `${item.val * 100}%`, 
                  height: '100%', 
                  backgroundColor: '#E9C176', 
                  borderRadius: 3, 
                  shadowColor: '#E9C176', 
                  shadowOpacity: 0.8, 
                  shadowRadius: 6, 
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 5 // for android glow
                }} 
              />
            </View>
            <Text style={{ color: '#E9C176', fontWeight: 'bold', width: 40, textAlign: 'right' }}>{item.pct}</Text>
          </View>
        ))}
      </View>

      <View style={styles.signalBox}>
        <Text style={{ color: '#E9C176', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 }}>Q2 2026 SIGNAL</Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 18 }}>Strong buy signals across 5th Settlement corridors. Avg 22% YoY growth projected.</Text>
      </View>
    </View>
  );
}

function AVMPanel() {
  return (
    <View style={styles.avmPanel}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#E9C176', marginRight: 8, shadowColor: '#E9C176', shadowOpacity: 0.8, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } }} />
          <Text style={styles.panelEyebrow}>AVM PREDICTIVE PRICING ENGINE</Text>
        </View>
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(233,193,118,0.3)' }}>
          <Text style={{ color: '#E9C176', fontSize: 9, fontWeight: '800', letterSpacing: 1 }}>LIVE</Text>
        </View>
      </View>
      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 6 }}>Avg compound price · EGP millions · 2020–2025</Text>

      <GlowingLineChart />

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 'auto' }}>
        <View style={styles.avmCard}>
          <Text style={styles.avmCardLabel}>Hyde Park</Text>
          <Text style={styles.avmCardVal}>EGP 18.5M</Text>
        </View>
        <View style={styles.avmCard}>
          <Text style={styles.avmCardLabel}>Mountain View</Text>
          <Text style={styles.avmCardVal}>EGP 11.2M</Text>
        </View>
        <View style={styles.avmCard}>
          <Text style={styles.avmCardLabel}>Mivida</Text>
          <Text style={styles.avmCardVal}>EGP 5.8M</Text>
        </View>
      </View>
    </View>
  );
}

export function AIEngineSection() {
  const colors = useColors();
  const { isDesktop, isTablet, contentMaxWidth } = useBreakpoint();
  const isWide = isDesktop || isTablet;
  const { isRTL } = useLanguage();

  return (
    <View style={[styles.section, { backgroundColor: '#111827' }]}>
      <View style={[styles.container, isWide && { maxWidth: contentMaxWidth as any, alignSelf: "center" }]}>
        
        <Animated.View entering={isWeb ? undefined : FadeIn.duration(800)} style={[styles.header]}>
          <Text style={styles.headerEyebrow}>{isRTL ? "منصة التشغيل الذكية" : "INTELLIGENCE OS PLATFORM"}</Text>
          <Text style={styles.headerTitle}>{isRTL ? "مدعوم بمحرك الذكاء الاصطناعي 3.0" : "Powered by AI Engine 3.0"}</Text>
        </Animated.View>

        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(200).springify()} style={[styles.dashRow, { flexDirection: isDesktop ? 'row' : 'column' }]}>
          <View style={{ flex: 1.3 }}>
            <AVMPanel />
          </View>
          <View style={{ flex: 1 }}>
            <ROIPanel />
          </View>
        </Animated.View>

        <View style={[styles.featuresRow, { flexDirection: isDesktop ? 'row' : 'column' }]}>
          {[
            { 
              title: isRTL ? "المطابقة الذكية" : "AI Dream Match", 
              desc: isRTL ? "صف أسلوب حياتك وسيقوم محرك الذكاء الاصطناعي الخاص بنا بمطابقتك فوراً مع العقار المثالي." : "Describe your lifestyle and our intelligence engine instantly matches you with the perfect property.", 
              icon: "star" 
            },
            { 
              title: isRTL ? "التسعير الآلي (AVM)" : "AVM Pricing", 
              desc: isRTL ? "نموذج تقييم آلي لحظي مدرب على أكثر من 12,000 معاملة في القاهرة بدقة تصل إلى 94%." : "Real-time automated valuation model trained on 12,000+ Cairo transactions with 94% accuracy.", 
              icon: "target" 
            },
            { 
              title: isRTL ? "تحليلات الاستثمار" : "ROI Analytics", 
              desc: isRTL ? "مصفوفات العائد المركب التي توضح زيادة القيمة، ودخل الإيجار، وإمكانيات إعادة الاستثمار." : "Compounding yield matrices showing appreciation, rental income, and reinvestment potential.", 
              icon: "bar-chart-2" 
            },
            { 
              title: isRTL ? "مستشار العقارات AI" : "Dream Home AI", 
              desc: isRTL ? "مستشار عقاري ثنائي اللغة للقاهرة الجديدة — مطابقة فورية للمجمعات السكنية." : "Bilingual AI advisor for New Cairo — instant compound matching in Arabic or English.", 
              icon: "cpu" 
            }
          ].map((f, i) => (
            <Animated.View key={i} entering={isWeb ? undefined : FadeInDown.delay(400 + i * 100).springify()} style={[isDesktop && { flex: 1 }]}>
              <Pressable style={({ pressed }) => [
                styles.featureCard, 
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
              ]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Feather name={f.icon as any} size={16} color="#E9C176" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>{f.title}</Text>
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 20, marginBottom: 20 }}>{f.desc}</Text>
                <Text style={{ color: '#E9C176', fontSize: 12, fontWeight: 'bold', marginTop: 'auto', textAlign: isRTL ? 'right' : 'left' }}>
                  {isRTL ? "استكشف +" : "+ Explore"}
                </Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 80,
    paddingHorizontal: 20,
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  container: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  headerEyebrow: {
    color: '#E9C176',
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: '800',
    marginBottom: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
  },
  dashRow: {
    gap: 20,
    marginBottom: 20,
  },
  avmPanel: {
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flex: 1,
  },
  roiPanel: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    flex: 1,
  },
  panelEyebrow: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
  },
  avmCard: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  avmCardLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginBottom: 6,
  },
  avmCardVal: {
    color: '#E9C176',
    fontSize: 16,
    fontWeight: '800',
  },
  signalBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    padding: 20,
    marginTop: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  featuresRow: {
    gap: 20,
  },
  featureCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  }
});
