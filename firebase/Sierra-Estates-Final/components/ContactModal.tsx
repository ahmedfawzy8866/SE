import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface ContactModalProps {
  visible: boolean;
  onClose: () => void;
  isRent: boolean;
  propertyTitle: string;
  onSubmit: () => void;
}

export function ContactModal({ visible, onClose, isRent, propertyTitle, onSubmit }: ContactModalProps) {
  const colors = useColors();
  
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [startsFrom, setStartsFrom] = useState("");
  const [duration, setDuration] = useState("");
  const [comment, setComment] = useState("");

  const isFormValid = name.trim().length > 0 && whatsapp.trim().length > 0;

  function handleSubmit() {
    if (!isFormValid) return;
    // In a real app, send data to API
    onSubmit();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Enquire Now</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={24} color={colors.text} />
            </Pressable>
          </View>
          
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Interested in {propertyTitle}? Leave your details and an advisor will contact you shortly.
          </Text>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Name */}
            <Text style={[styles.label, { color: colors.text }]}>Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Full Name"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
            />

            {/* WhatsApp */}
            <Text style={[styles.label, { color: colors.text }]}>WhatsApp Number *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="+20 100 000 0000"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              value={whatsapp}
              onChangeText={setWhatsapp}
            />

            {/* Rent Fields */}
            {isRent && (
              <>
                <Text style={[styles.label, { color: colors.text }]}>Starts from when?</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g. Next week, Oct 1st"
                  placeholderTextColor={colors.mutedForeground}
                  value={startsFrom}
                  onChangeText={setStartsFrom}
                />
                
                <Text style={[styles.label, { color: colors.text }]}>For how long?</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g. 6 months, 1 year"
                  placeholderTextColor={colors.mutedForeground}
                  value={duration}
                  onChangeText={setDuration}
                />
              </>
            )}

            {/* Comment */}
            <Text style={[styles.label, { color: colors.text }]}>Comment / Text Request (Optional)</Text>
            <TextInput
              style={[
                styles.input, 
                styles.textArea,
                { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }
              ]}
              placeholder="Any specific requirements?"
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                { 
                  backgroundColor: isFormValid ? colors.gold : colors.card, 
                  borderColor: isFormValid ? colors.gold : colors.border,
                  opacity: pressed ? 0.85 : 1 
                }
              ]}
              disabled={!isFormValid}
              onPress={handleSubmit}
            >
              <Text style={[styles.submitBtnText, { color: isFormValid ? colors.navyDeep : colors.mutedForeground }]}>
                Send Request
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    paddingHorizontal: 20,
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  form: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    borderTopWidth: 1,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
