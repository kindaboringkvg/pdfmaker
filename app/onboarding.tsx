import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Animated, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store/useAppStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Onboarding() {
  const C = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendWA, setSendWA] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const STEPS = [
    {
      icon: 'scan-outline',
      title: 'Scan Once.',
      subtitle: 'Everything else happens automatically.',
      description: 'PrivacyScan creates high-quality PDFs from your documents and delivers them where you need them.',
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Your Documents Stay On Your Phone.',
      subtitle: 'Privacy-first architecture.',
      description: 'Documents are never permanently stored on external servers. Local processing. Zero cloud.',
    },
    {
      icon: 'send-outline',
      title: 'Setup Auto-Delivery.',
      subtitle: 'Where should your scans go?',
      description: 'Enter your email and/or WhatsApp number to enable automatic delivery.',
    },
  ];

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS.length - 1) {
      Animated.timing(slideAnim, {
        toValue: -(step + 1) * 100,
        duration: 320,
        useNativeDriver: true,
      }).start(() => setStep((s) => s + 1));
    } else {
      completeOnboarding(email, whatsapp, sendEmail, sendWA);
      router.replace('/(tabs)/scanner');
    }
  };

  const current = STEPS[step];

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <LinearGradient
        colors={[`${C.primary}18`, 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled">
          {/* Step indicator */}
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i === step ? C.primary : C.outlineVariant },
                  i === step && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: `${C.primary}15`, borderColor: `${C.primary}30` }]}>
            <Ionicons name={current.icon as any} size={48} color={C.primary} />
          </View>

          {/* Text */}
          <Text style={[styles.title, { color: C.onSurface }]}>{current.title}</Text>
          <Text style={[styles.subtitle, { color: C.primary }]}>{current.subtitle}</Text>
          <Text style={[styles.description, { color: C.onSurfaceVariant }]}>{current.description}</Text>

          {/* Step 2: inputs */}
          {step === 2 && (
            <View style={styles.inputs}>
              <View style={[styles.inputWrap, { backgroundColor: C.surfaceContainer, borderColor: C.outlineVariant }]}>
                <Ionicons name="mail-outline" size={20} color={C.onSurfaceVariant} />
                <TextInput
                  style={[styles.input, { color: C.onSurface }]}
                  placeholder="Email address"
                  placeholderTextColor={C.onSurfaceVariant}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              <View style={[styles.inputWrap, { backgroundColor: C.surfaceContainer, borderColor: C.outlineVariant }]}>
                <Ionicons name="logo-whatsapp" size={20} color={C.onSurfaceVariant} />
                <TextInput
                  style={[styles.input, { color: C.onSurface }]}
                  placeholder="WhatsApp number (e.g. +1 555 0100)"
                  placeholderTextColor={C.onSurfaceVariant}
                  keyboardType="phone-pad"
                  value={whatsapp}
                  onChangeText={setWhatsapp}
                />
              </View>

              {/* Toggles */}
              <View style={styles.toggles}>
                <TouchableOpacity
                  style={[styles.toggleChip, { backgroundColor: sendEmail ? `${C.primary}20` : C.surfaceContainer, borderColor: sendEmail ? C.primary : C.outlineVariant }]}
                  onPress={() => { setSendEmail(!sendEmail); Haptics.selectionAsync(); }}
                >
                  <Ionicons name="mail" size={16} color={sendEmail ? C.primary : C.onSurfaceVariant} />
                  <Text style={[styles.toggleLabel, { color: sendEmail ? C.primary : C.onSurfaceVariant }]}>Auto-email</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleChip, { backgroundColor: sendWA ? `${C.primary}20` : C.surfaceContainer, borderColor: sendWA ? C.primary : C.outlineVariant }]}
                  onPress={() => { setSendWA(!sendWA); Haptics.selectionAsync(); }}
                >
                  <Ionicons name="logo-whatsapp" size={16} color={sendWA ? C.primary : C.onSurfaceVariant} />
                  <Text style={[styles.toggleLabel, { color: sendWA ? C.primary : C.onSurfaceVariant }]}>Auto-WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* CTA */}
          <TouchableOpacity
            style={[styles.cta, { backgroundColor: C.primary }]}
            onPress={goNext}
            activeOpacity={0.85}
          >
            <Text style={[styles.ctaText, { color: C.onPrimary }]}>
              {step < STEPS.length - 1 ? 'Continue' : 'Start Scanning'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={C.onPrimary} />
          </TouchableOpacity>

          {step === 2 && (
            <TouchableOpacity onPress={goNext} style={styles.skip}>
              <Text style={[styles.skipText, { color: C.onSurfaceVariant }]}>Skip setup for now</Text>
            </TouchableOpacity>
          )}

          {/* Privacy note */}
          <View style={[styles.privacyBadge, { backgroundColor: `${C.secondary}12`, borderColor: `${C.secondary}25` }]}>
            <Ionicons name="shield-checkmark" size={14} color={C.secondary} />
            <Text style={[styles.privacyText, { color: C.secondary }]}>PRIVACY-FIRST · ON-DEVICE PROCESSING</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 20,
  },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 24 },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  inputs: { width: '100%', gap: 12 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: { flex: 1, fontSize: 15 },
  toggles: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  toggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  toggleLabel: { fontSize: 13, fontWeight: '600' },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    height: 58,
    borderRadius: 18,
    marginTop: 8,
  },
  ctaText: { fontSize: 17, fontWeight: '700' },
  skip: { marginTop: -8 },
  skipText: { fontSize: 14 },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 8,
  },
  privacyText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
});
