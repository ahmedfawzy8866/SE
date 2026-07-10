import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useTheme } from '@/context/ThemeContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import Animated, { FadeInDown } from 'react-native-reanimated';

const isWeb = Platform.OS === 'web';

export default function CareersPage() {
  const colors = useColors();
  const { isDark } = useTheme();
  const { isDesktop, isTablet, contentMaxWidth } = useBreakpoint();
  const isWide = isDesktop || isTablet;

  const JOBS = [
    { title: 'Senior AI Engineer', type: 'Full-time', location: 'Cairo, Egypt (Hybrid)', desc: 'Help build our Intelligence OS. Expertise in Python, TensorFlow, and predictive modeling required.' },
    { title: 'Luxury Property Consultant', type: 'Full-time', location: 'New Cairo, Egypt', desc: 'Join our elite network of brokers. Deep knowledge of New Cairo compounds and high-net-worth client management essential.' },
    { title: 'Frontend Developer (React Native)', type: 'Full-time', location: 'Remote', desc: 'Craft seamless, premium cross-platform experiences. React Native and Reanimated expertise required.' },
    { title: 'Data Scientist (Real Estate)', type: 'Full-time', location: 'Cairo, Egypt', desc: 'Analyze real estate market trends and optimize our AVM pricing algorithms.' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Navigation Back */}
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </Pressable>

        <View style={[styles.inner, isWide && { maxWidth: contentMaxWidth as any, alignSelf: 'center', width: '100%' }]}>
          
          {/* Header */}
          <Animated.View entering={isWeb ? undefined : FadeInDown.springify()} style={styles.header}>
            <View style={[styles.badge, { backgroundColor: colors.gold + '22' }]}>
              <Text style={[styles.badgeText, { color: colors.gold }]}>WE'RE HIRING</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Join the Future of Real Estate</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              We are building the first AI-driven real estate platform for New Cairo. We're looking for passionate engineers, data scientists, and elite property consultants to join our mission.
            </Text>
          </Animated.View>

          {/* Job Listings */}
          <View style={styles.jobsList}>
            {JOBS.map((job, idx) => (
              <Animated.View key={idx} entering={isWeb ? undefined : FadeInDown.delay(200 + idx * 100).springify()}>
                <View style={[styles.jobCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.jobHeader}>
                    <Text style={[styles.jobTitle, { color: colors.text }]}>{job.title}</Text>
                    <Pressable style={[styles.applyBtn, { backgroundColor: colors.gold }]}>
                      <Text style={[styles.applyBtnText, { color: colors.navyDeep }]}>Apply</Text>
                    </Pressable>
                  </View>
                  
                  <View style={styles.jobMeta}>
                    <View style={styles.metaItem}>
                      <Feather name="briefcase" size={14} color={colors.mutedForeground} />
                      <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{job.type}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Feather name="map-pin" size={14} color={colors.mutedForeground} />
                      <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{job.location}</Text>
                    </View>
                  </View>

                  <Text style={[styles.jobDesc, { color: colors.textSecondary }]}>{job.desc}</Text>
                </View>
              </Animated.View>
            ))}
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 40 : 20,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  inner: {
    padding: 24,
    paddingTop: Platform.OS === 'web' ? 100 : 80,
  },
  header: {
    marginBottom: 48,
    alignItems: 'flex-start',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 26,
    maxWidth: 600,
  },
  jobsList: {
    gap: 16,
  },
  jobCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  applyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 16,
  },
  applyBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  jobMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
  },
  jobDesc: {
    fontSize: 15,
    lineHeight: 24,
  }
});
