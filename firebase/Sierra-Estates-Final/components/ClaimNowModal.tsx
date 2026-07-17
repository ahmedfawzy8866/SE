import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useClaim } from "@/context/ClaimContext";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/context/LanguageContext";

const { width: WINDOW_W, height: WINDOW_H } = Dimensions.get("window");
const W = Platform.OS === "web" ? Math.min(WINDOW_W, 480) : WINDOW_W;
const H = WINDOW_H;

interface ClaimNowModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ClaimNowModal({ visible, onClose }: ClaimNowModalProps) {
  const colors = useColors();
  const { t, isRTL } = useLanguage();
  const { saveClaim } = useClaim();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState("");
  const [preferredType, setPreferredType] = useState("");
  const [compound, setCompound] = useState("");
  const [txType, setTxType] = useState<"buy" | "lease">("buy");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recording, setRecording] = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;

  const compoundsList = ["Mivida", "Hyde Park", "Mountain View", "Uptown Cairo", "Villette", "Palm Hills", "Madinaty", "Al Rehab"];
  const compoundsListAr = ["ميفيدا", "هايد بارك", "ماونتن فيو", "أبتاون كايرو", "فيلت", "بالم هيلز", "مدينتي", "الرحاب"];
  const compounds = isRTL ? compoundsListAr : compoundsList;

  const buyBudgets = isRTL 
    ? ["١ - ٥ مليون ج.م", "٥ - ١٠ مليون ج.م", "١٠ - ٢٠ مليون ج.م", "٢٠ - ٥٠ مليون ج.م", "٥٠ مليون+ ج.م"]
    : ["1M – 5M LE", "5M – 10M LE", "10M – 20M LE", "20M – 50M LE", "50M+ LE"];

  const leaseBudgets = isRTL
    ? ["أقل من ٢,٠٠٠$/شهرياً", "٢,٠٠٠$ - ٥,٠٠٠$/شهرياً", "٥,٠٠٠$ - ١٠,٠٠٠$/شهرياً", "١٠,٠٠٠$ - ١٥,٠٠٠$/شهرياً"]
    : ["Under $2,000/mo", "$2,000 – $5,000/mo", "$5,000 – $10,000/mo", "$10,000 – $15,000/mo"];

  const budgetOptions = txType === "buy" ? buyBudgets : leaseBudgets;

  function resetForm() {
    setName(""); setPhone(""); setMessage(""); setBudget(""); setPreferredType("");
    setCompound(""); setTxType("buy");
    setSubmitting(false); setSuccess(false); setRecording(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit() {
    if (!name.trim() || !phone.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    saveClaim({ 
      name: name.trim(), 
      phone: phone.trim(), 
      message: message.trim(), 
      budget, 
      preferredType, 
      compound, 
      txType 
    });
    setSubmitting(false);
    setSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.spring(successAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }).start();
  }

  function goToSearch() {
    handleClose();
    setTimeout(() => router.push("/(tabs)/listings" as any), 100);
  }

  function goToMap() {
    handleClose();
    setTimeout(() => router.push("/(tabs)/map" as any), 100);
  }

  const align = isRTL ? "right" : "left";
  const textAlign = isRTL ? "right" : "left";

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" statusBarTranslucent onRequestClose={handleClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={[styles.root, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { borderBottomColor: colors.border, flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.headerEyebrow, { color: colors.gold, textAlign }]}>{t.limitedAccess}</Text>
              <Text style={[styles.headerTitle, { color: colors.text, textAlign }]}>{t.claimTitle}</Text>
            </View>
            <Pressable style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleClose}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {!success ? (
            <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={[styles.formSub, { color: colors.mutedForeground, textAlign }]}>{t.claimSub}</Text>

              {/* 1. Compound Selection */}
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, textAlign }]}>
                {isRTL ? "الكمبوند / المشروع بالقاهرة الجديدة" : "Compound / Project in New Cairo"}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.optionRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                {compounds.map((opt, i) => {
                  const rawOpt = compoundsList[i];
                  const isSelected = compound === rawOpt;
                  return (
                    <Pressable
                      key={rawOpt}
                      style={[styles.optionChip, {
                        backgroundColor: isSelected ? colors.gold + "25" : colors.card,
                        borderColor: isSelected ? colors.gold : colors.border,
                      }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setCompound(rawOpt);
                      }}
                    >
                      <Text style={[styles.optionText, { color: isSelected ? colors.gold : colors.mutedForeground }]}>{opt}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* 2. Goal/Transaction Selection */}
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, textAlign }]}>
                {isRTL ? "الهدف" : "My Goal"}
              </Text>
              <View style={[styles.typeGrid, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                {[
                  { value: "buy", label: isRTL ? "شراء وتملك" : "Buy / Purchase" },
                  { value: "lease", label: isRTL ? "إيجار طويل الأجل" : "Lease / Tenancy" }
                ].map((opt) => {
                  const isSelected = txType === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      style={[styles.typeChip, {
                        backgroundColor: isSelected ? colors.gold + "25" : colors.card,
                        borderColor: isSelected ? colors.gold : colors.border,
                        flex: 1,
                        alignItems: "center"
                      }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setTxType(opt.value as any);
                        setBudget(""); // reset budget
                      }}
                    >
                      <Text style={[styles.optionText, { color: isSelected ? colors.gold : colors.mutedForeground }]}>{opt.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* 3. Budget selection (EGP for Buy vs USD for Lease) */}
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, textAlign }]}>
                {isRTL ? "نطاق الميزانية" : "Budget Range"}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.optionRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                {budgetOptions.map((opt) => (
                  <Pressable
                    key={opt}
                    style={[styles.optionChip, {
                      backgroundColor: budget === opt ? colors.gold + "25" : colors.card,
                      borderColor: budget === opt ? colors.gold : colors.border,
                    }]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setBudget(opt); }}
                  >
                    <Text style={[styles.optionText, { color: budget === opt ? colors.gold : colors.mutedForeground }]}>{opt}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* 4. Preferred Property Type */}
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, textAlign }]}>{t.preferredType}</Text>
              <View style={[styles.typeGrid, { flexDirection: isRTL ? "row-reverse" : "row", marginBottom: 12 }]}>
                {(t.typeOptions || (isRTL ? ["شقة", "فيلا", "تاون هاوس", "بنتهاوس"] : ["Apartment", "Villa", "Townhouse", "Penthouse"])).map((opt) => (
                  <Pressable
                    key={opt}
                    style={[styles.typeChip, {
                      backgroundColor: preferredType === opt ? colors.gold + "25" : colors.card,
                      borderColor: preferredType === opt ? colors.gold : colors.border,
                    }]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPreferredType(opt); }}
                  >
                    <Text style={[styles.optionText, { color: preferredType === opt ? colors.gold : colors.mutedForeground }]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 24, opacity: 0.6 }} />

              {/* 5. Personal Details (Name, Phone, message/voice) */}
              <Field label={t.yourName} value={name} onChange={setName} icon="user" colors={colors} placeholder={isRTL ? "أحمد محمد" : "James Davidson"} textAlign={textAlign} isRTL={isRTL} />
              <Field label={t.yourPhone} value={phone} onChange={setPhone} icon="phone" colors={colors} placeholder="+20 100 123 4567" keyboard="phone-pad" textAlign={textAlign} isRTL={isRTL} />

              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, textAlign }]}>
                {isRTL ? "رسالتك (اختياري)" : "Message (Optional)"}
              </Text>
              <View style={[styles.fieldRow, { backgroundColor: colors.card, borderColor: colors.border, alignItems: "flex-start", height: 100, flexDirection: isRTL ? "row-reverse" : "row", paddingVertical: 10 }]}>
                <Feather name="message-square" size={16} color={colors.mutedForeground} style={{ marginTop: 2 }} />
                <TextInput
                  style={[styles.fieldInput, { color: colors.text, textAlign, height: '100%' }]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder={isRTL ? "اكتب رسالتك هنا..." : "Type your message here..."}
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <Pressable 
                style={({ pressed }) => [styles.voiceBtn, { backgroundColor: recording ? colors.destructive + "20" : colors.card, borderColor: recording ? colors.destructive : colors.border, opacity: pressed ? 0.7 : 1, flexDirection: isRTL ? "row-reverse" : "row" }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setRecording(!recording);
                }}
              >
                <Feather name={recording ? "square" : "mic"} size={16} color={recording ? colors.destructive : colors.gold} />
                <Text style={[styles.voiceBtnText, { color: recording ? colors.destructive : colors.text }]}>
                  {recording ? (isRTL ? "إيقاف التسجيل..." : "Stop Recording...") : (isRTL ? "تسجيل رسالة صوتية" : "Record Voice Message")}
                </Text>
              </Pressable>

              <View style={[styles.promoBox, { backgroundColor: colors.gold + "12", borderColor: colors.gold + "40" }]}>
                <Feather name="tag" size={14} color={colors.gold} />
                <Text style={[styles.promoBoxText, { color: colors.text, textAlign }]}>
                  {isRTL ? "خصم 25% سيُطبَّق تلقائياً على طلبك" : "Your 25% discount will be automatically applied to your request"}
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.submitBtn,
                  { backgroundColor: (!name.trim() || !phone.trim() || submitting) ? colors.gold + "55" : colors.gold, opacity: pressed ? 0.9 : 1 },
                ]}
                onPress={handleSubmit}
                disabled={!name.trim() || !phone.trim() || submitting}
              >
                {submitting ? (
                  <Text style={[styles.submitBtnText, { color: colors.navyDeep }]}>{t.submitting}</Text>
                ) : (
                  <>
                    <Feather name="check-circle" size={17} color={colors.navyDeep} />
                    <Text style={[styles.submitBtnText, { color: colors.navyDeep }]}>{t.submit}</Text>
                  </>
                )}
              </Pressable>
            </ScrollView>
          ) : (
            <Animated.View
              style={[styles.successContainer, {
                opacity: successAnim,
                transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
              }]}
            >
              <View style={[styles.successIcon, { backgroundColor: colors.gold + "20", borderColor: colors.gold + "44" }]}>
                <Feather name="check-circle" size={48} color={colors.gold} />
              </View>
              <Text style={[styles.successTitle, { color: colors.text, textAlign: "center" }]}>{t.successTitle}</Text>
              <Text style={[styles.successSub, { color: colors.mutedForeground, textAlign: "center" }]}>{t.successSub}</Text>

              <View style={[styles.claimBadge, { backgroundColor: colors.gold, borderRadius: 10, padding: 16, alignSelf: "stretch" }]}>
                <Text style={[styles.claimBadgeLabel, { color: colors.navyDeep }]}>
                  {isRTL ? "الاسم:" : "Name:"} {name}
                </Text>
                {compound ? (
                  <Text style={[styles.claimBadgeLabel, { color: colors.navyDeep }]}>
                    {isRTL ? "المشروع/الكمبوند:" : "Project/Compound:"} {compounds[compoundsList.indexOf(compound)] || compound}
                  </Text>
                ) : null}
                <Text style={[styles.claimBadgeLabel, { color: colors.navyDeep }]}>
                  {isRTL ? "الهدف:" : "Goal:"} {txType === "buy" ? (isRTL ? "شراء وتملك" : "Buy / Purchase") : (isRTL ? "إيجار طويل الأجل" : "Lease / Tenancy")}
                </Text>
                {budget ? (
                  <Text style={[styles.claimBadgeLabel, { color: colors.navyDeep }]}>
                    {isRTL ? "الميزانية:" : "Budget:"} {budget}
                  </Text>
                ) : null}
                {preferredType ? (
                  <Text style={[styles.claimBadgeLabel, { color: colors.navyDeep }]}>
                    {isRTL ? "نوع العقار:" : "Type:"} {preferredType}
                  </Text>
                ) : null}
                <Text style={[styles.claimBadgeSub, { color: colors.navyDeep + "BB" }]}>
                  {isRTL ? "الخصم: 25% محجوز لك ✓" : "Discount: 25% reserved ✓"}
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [styles.goBtn, { backgroundColor: colors.gold, opacity: pressed ? 0.85 : 1 }]}
                onPress={goToSearch}
              >
                <Feather name="search" size={16} color={colors.navyDeep} />
                <Text style={[styles.goBtnText, { color: colors.navyDeep }]}>{t.goToSearch}</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.goMapBtn, { backgroundColor: colors.card, borderColor: colors.gold, opacity: pressed ? 0.85 : 1 }]}
                onPress={goToMap}
              >
                <Feather name="map" size={16} color={colors.gold} />
                <Text style={[styles.goBtnText, { color: colors.gold }]}>{t.goToMap}</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({ label, value, onChange, icon, colors, placeholder, keyboard, textAlign, isRTL }: any) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground, textAlign }]}>{label}</Text>
      <View style={[styles.fieldRow, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Feather name={icon} size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.fieldInput, { color: colors.text, textAlign }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType={keyboard ?? "default"}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: Platform.OS === "ios" ? 20 : 16, paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTextWrap: { flex: 1 },
  headerEyebrow: { fontSize: 12, fontWeight: "700", letterSpacing: 1.5, marginBottom: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  closeBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center", marginLeft: 12 },
  form: { padding: 20, paddingBottom: 48 },
  formSub: { fontSize: 14, lineHeight: 20, marginBottom: 24 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, marginBottom: 8 },
  fieldRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13,
  },
  fieldInput: { flex: 1, fontSize: 14 },
  optionRow: { gap: 8, marginBottom: 20, paddingBottom: 4 },
  optionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  optionText: { fontSize: 14, fontWeight: "600" },
  typeGrid: { flexWrap: "wrap", gap: 8, marginBottom: 20 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  promoBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 24,
  },
  promoBoxText: { flex: 1, fontSize: 14, lineHeight: 19 },
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 16, borderRadius: 10,
  },
  submitBtnText: { fontSize: 15, fontWeight: "800" },
  successContainer: {
    flex: 1, padding: 24, alignItems: "center", justifyContent: "center", gap: 16,
  },
  successIcon: { width: 90, height: 90, borderRadius: 45, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  successTitle: { fontSize: 24, fontWeight: "800" },
  successSub: { fontSize: 14, lineHeight: 20 },
  claimBadge: { alignSelf: "stretch", gap: 4 },
  claimBadgeLabel: { fontSize: 14, fontWeight: "700" },
  claimBadgeSub: { fontSize: 14, marginTop: 4 },
  goBtn: {
    alignSelf: "stretch", flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 10, paddingVertical: 15, borderRadius: 10,
  },
  goMapBtn: {
    alignSelf: "stretch", flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 10, paddingVertical: 15, borderRadius: 10, borderWidth: 1.5,
  },
  goBtnText: { fontSize: 15, fontWeight: "800" },
  voiceBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    paddingVertical: 14, borderRadius: 10, borderWidth: 1, marginBottom: 24, marginTop: 12
  },
  voiceBtnText: { fontSize: 14, fontWeight: "600" },
});
