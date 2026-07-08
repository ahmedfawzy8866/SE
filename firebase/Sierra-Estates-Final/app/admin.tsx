import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  fetchAdminTasks,
  toggleAdminTaskCompletion,
  seedAdminTasksToFirebase,
} from "../lib/firebase";
import { fetchCRMSummary } from "../lib/crm";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#040C16",
  surface: "#0A1828",
  card: "#0D1F35",
  gold: "#C8961A",
  goldLight: "#E9C176",
  goldFaint: "rgba(200,150,26,0.12)",
  text: "#F0EDE5",
  muted: "rgba(240, 237, 229, 0.55)",
  border: "rgba(255,255,255,0.08)",
  green: "#34D399",
  blue: "#60A5FA",
  orange: "#FB923C",
  red: "#F87171",
  purple: "#A78BFA",
};

// ─── CRM Summary Card ──────────────────────────────────────────────────────────
const CRMCard = ({ summary }: { summary: any }) => (
  <View style={styles.crmCard}>
    <View style={styles.crmHeader}>
      <Feather name="activity" size={18} color={C.gold} />
      <Text style={styles.crmTitle}>Hermes CRM — Live Overview</Text>
    </View>
    <View style={styles.crmGrid}>
      <Stat label="Total Leads" value={summary.total} color={C.blue} />
      <Stat label="New" value={summary.new} color={C.goldLight} />
      <Stat label="Qualified" value={summary.qualified} color={C.green} />
      <Stat label="Negotiating" value={summary.negotiating} color={C.orange} />
      <Stat label="Closed 🏆" value={summary.closed} color={C.purple} />
      <Stat label="Lost" value={summary.lost} color={C.red} />
    </View>
  </View>
);

const Stat = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <View style={styles.statCell}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─── Phase Badge ──────────────────────────────────────────────────────────────
const phaseBadgeColor: Record<string, string> = {
  phase1: C.blue,
  phase2: C.gold,
  phase3: C.green,
  phase4: C.purple,
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AdminPage() {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    total: 0, new: 0, qualified: 0, negotiating: 0, closed: 0, lost: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    let data = await fetchAdminTasks();
    if (data.length === 0) {
      await seedAdminTasksToFirebase();
      data = await fetchAdminTasks();
    }
    const crmSummary = await fetchCRMSummary();
    setTasks(data);
    setSummary(crmSummary);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleToggle = async (
    groupId: string, taskIndex: number, currentItems: any[], groupIndex: number
  ) => {
    const newItems = await toggleAdminTaskCompletion(groupId, taskIndex, currentItems);
    const updated = [...tasks];
    updated[groupIndex].items = newItems;
    setTasks(updated);
  };

  const completedCount = (items: any[]) => items.filter((i: any) => i.completed).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <View>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Sierra Estates · Antigravity OS</Text>
        </View>
        <Pressable onPress={() => { setRefreshing(true); loadAll(); }} style={styles.backBtn}>
          <Feather name="refresh-cw" size={20} color={C.gold} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAll(); }} tintColor={C.gold} />
        }
      >
        {/* Hermes Status Banner */}
        <View style={styles.hermesBanner}>
          <Feather name="zap" size={16} color={C.gold} />
          <Text style={styles.hermesText}>
            HERMES is active — powered by OpenClaw + Hermes JS Engine
          </Text>
          <View style={styles.activeDot} />
        </View>

        {/* CRM Summary */}
        {loading ? (
          <ActivityIndicator size="large" color={C.gold} style={{ marginTop: 40 }} />
        ) : (
          <>
            <CRMCard summary={summary} />

            {/* Enhancement Plan */}
            <Text style={styles.sectionTitle}>Enhancement Plan</Text>
            <Text style={styles.sectionSub}>
              Tap tasks to mark them complete. Changes sync to Firebase in real-time.
            </Text>

            {tasks.map((group, idx) => {
              const done = completedCount(group.items);
              const total = group.items.length;
              const progress = total > 0 ? done / total : 0;
              const badgeColor = phaseBadgeColor[group.id] || C.gold;

              return (
                <View key={group.id} style={styles.card}>
                  {/* Phase Header */}
                  <View style={styles.phaseHeader}>
                    <View style={[styles.phaseBadge, { backgroundColor: `${badgeColor}22`, borderColor: badgeColor }]}>
                      <Text style={[styles.phaseBadgeText, { color: badgeColor }]}>
                        {group.id.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.phaseTitle}>{group.phase}</Text>
                  </View>

                  {/* Progress bar */}
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: badgeColor }]} />
                  </View>
                  <Text style={[styles.progressText, { color: badgeColor }]}>
                    {done}/{total} completed
                  </Text>

                  {/* Tasks */}
                  {group.items.map((item: any, i: number) => (
                    <Pressable
                      key={i}
                      style={styles.taskRow}
                      onPress={() => handleToggle(group.id, i, group.items, idx)}
                    >
                      <View style={[styles.checkbox, item.completed && { backgroundColor: badgeColor, borderColor: badgeColor }]}>
                        {item.completed && <Feather name="check" size={12} color={C.bg} />}
                      </View>
                      <Text style={[styles.taskText, item.completed && styles.taskDone]}>
                        {item.title}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              );
            })}

            {/* Hermes Skills Card */}
            <View style={styles.skillsCard}>
              <Text style={styles.skillsTitle}>🤖 Hermes Agent Skills</Text>
              {[
                { icon: "message-circle", skill: "Communication", desc: "Bilingual (AR/EN), WhatsApp-optimized messaging" },
                { icon: "trending-up", skill: "Sales (SPIN)", desc: "Situation · Problem · Implication · Need-Payoff" },
                { icon: "briefcase", skill: "Negotiation (BATNA)", desc: "Anchoring, concession framework, conditional close" },
                { icon: "search", skill: "AI Property Search", desc: "Natural language queries via OpenClaw vector search" },
                { icon: "users", skill: "Lead Extraction", desc: "Auto-captures budget, area, property type from chat" },
              ].map(({ icon, skill, desc }) => (
                <View key={skill} style={styles.skillRow}>
                  <Feather name={icon as any} size={16} color={C.gold} style={{ marginRight: 10 }} />
                  <View>
                    <Text style={styles.skillName}>{skill}</Text>
                    <Text style={styles.skillDesc}>{desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Environment Card */}
            <View style={styles.envCard}>
              <Text style={styles.envTitle}>⚙️ Runtime Environment</Text>
              <EnvRow label="JS Engine" value="Hermes ✅" />
              <EnvRow label="AI Gateway" value="OpenClaw v2026" />
              <EnvRow label="ECC Crypto" value="react-native-ecc ✅" />
              <EnvRow label="Database" value="Firebase Firestore" />
              <EnvRow label="WhatsApp" value="Business API v19" />
              <EnvRow label="Search" value="OpenClaw Vector Index" />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const EnvRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.envRow}>
    <Text style={styles.envLabel}>{label}</Text>
    <Text style={styles.envValue}>{value}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: { padding: 6 },
  title: { fontFamily: "Outfit-Bold", fontSize: 22, color: C.goldLight },
  subtitle: { fontFamily: "Inter", fontSize: 12, color: C.muted, marginTop: 2 },
  scroll: { padding: 20, paddingBottom: 50 },

  hermesBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.goldFaint, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: `${C.gold}33`, marginBottom: 20,
  },
  hermesText: { flex: 1, color: C.goldLight, fontSize: 13, fontFamily: "Inter" },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.green },

  crmCard: {
    backgroundColor: C.card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: C.border, marginBottom: 24,
  },
  crmHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  crmTitle: { color: C.text, fontFamily: "Outfit-Bold", fontSize: 15 },
  crmGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCell: { width: "30%", alignItems: "center", paddingVertical: 8 },
  statValue: { fontSize: 26, fontFamily: "Outfit-Bold" },
  statLabel: { color: C.muted, fontSize: 11, marginTop: 2, fontFamily: "Inter" },

  sectionTitle: {
    color: C.text, fontFamily: "Outfit-Bold", fontSize: 18, marginBottom: 6,
  },
  sectionSub: { color: C.muted, fontSize: 13, fontFamily: "Inter", marginBottom: 20 },

  card: {
    backgroundColor: C.card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: C.border, marginBottom: 16,
  },
  phaseHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  phaseBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1,
  },
  phaseBadgeText: { fontSize: 11, fontFamily: "Outfit-Bold" },
  phaseTitle: { flex: 1, color: C.text, fontFamily: "Outfit-Bold", fontSize: 14 },

  progressBar: {
    height: 4, backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2, marginBottom: 6, overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 2 },
  progressText: { fontSize: 11, fontFamily: "Inter", marginBottom: 12 },

  taskRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 1,
    borderColor: C.gold, marginRight: 12, marginTop: 2,
    alignItems: "center", justifyContent: "center",
  },
  taskText: { flex: 1, color: C.text, fontFamily: "Inter", fontSize: 14, lineHeight: 22 },
  taskDone: { textDecorationLine: "line-through", color: C.muted },

  skillsCard: {
    backgroundColor: C.card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: C.border, marginBottom: 16,
  },
  skillsTitle: { color: C.text, fontFamily: "Outfit-Bold", fontSize: 16, marginBottom: 14 },
  skillRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  skillName: { color: C.goldLight, fontFamily: "Outfit-Bold", fontSize: 13 },
  skillDesc: { color: C.muted, fontFamily: "Inter", fontSize: 12, marginTop: 2 },

  envCard: {
    backgroundColor: C.card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: C.border, marginBottom: 16,
  },
  envTitle: { color: C.text, fontFamily: "Outfit-Bold", fontSize: 16, marginBottom: 14 },
  envRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  envLabel: { color: C.muted, fontFamily: "Inter", fontSize: 13 },
  envValue: { color: C.green, fontFamily: "Outfit-Bold", fontSize: 13 },
});
