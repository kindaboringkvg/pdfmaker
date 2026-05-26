import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore, ThemeMode, ImageQuality, DeletePolicy } from '../../store/useAppStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { GlassCard } from '../../components/ui/GlassCard';
import { ToggleRow } from '../../components/ui/ToggleRow';

function SectionLabel({ label }: { label: string }) {
  const C = useThemeColors();
  return (
    <Text style={[styles.sectionLabel, { color: `${C.onSurfaceVariant}90` }]}>{label.toUpperCase()}</Text>
  );
}

function RowItem({ icon, label, value, onPress, last = false }: {
  icon: string; label: string; value?: string; onPress?: () => void; last?: boolean;
}) {
  const C = useThemeColors();
  return (
    <TouchableOpacity
      style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.outlineVariant }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon as any} size={18} color={C.onSurfaceVariant} />
        <View style={styles.rowText}>
          <Text style={[styles.rowLabel, { color: C.onSurface }]}>{label}</Text>
          {value ? <Text style={[styles.rowValue, { color: C.onSurfaceVariant }]}>{value}</Text> : null}
        </View>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={16} color={C.outline} />}
    </TouchableOpacity>
  );
}

function ThemeButton({ mode, label, icon, active, onPress }: {
  mode: ThemeMode; label: string; icon: string; active: boolean; onPress: () => void;
}) {
  const C = useThemeColors();
  return (
    <TouchableOpacity
      style={[
        styles.themeBtn,
        active && { backgroundColor: C.primaryContainer },
        !active && { backgroundColor: C.surfaceContainerHigh },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon as any} size={22} color={active ? C.onPrimaryContainer : C.onSurfaceVariant} />
      <Text style={[styles.themeBtnText, { color: active ? C.onPrimaryContainer : C.onSurfaceVariant }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const C = useThemeColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useAppStore();

  const [editingEmail, setEditingEmail] = useState(false);
  const [editingWA, setEditingWA] = useState(false);
  const [emailDraft, setEmailDraft] = useState(settings.email);
  const [waDraft, setWaDraft] = useState(settings.whatsapp);

  const update = (partial: Parameters<typeof updateSettings>[0]) => {
    updateSettings(partial);
    Haptics.selectionAsync();
  };

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <LinearGradient colors={[`${C.primary}0F`, 'transparent']} style={styles.gradient} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: C.primary }]}>Automation</Text>
          <Text style={[styles.pageSub, { color: C.onSurfaceVariant }]}>
            Streamline your scanning workflow.
          </Text>
        </View>

        {/* User Information */}
        <SectionLabel label="User Information" />
        <GlassCard style={styles.card}>
          <RowItem
            icon="mail-outline"
            label="Email Address"
            value={settings.email || 'Not set'}
            onPress={() => { setEmailDraft(settings.email); setEditingEmail(true); }}
          />
          <RowItem
            icon="logo-whatsapp"
            label="WhatsApp Number"
            value={settings.whatsapp || 'Not set'}
            onPress={() => { setWaDraft(settings.whatsapp); setEditingWA(true); }}
            last
          />
        </GlassCard>

        {/* Workflow Automation */}
        <SectionLabel label="Workflow Automation" />
        <GlassCard style={styles.card}>
          <ToggleRow
            label="Auto-Send after scan"
            subtitle="Instantly share to default contacts"
            value={settings.autoSend}
            onValueChange={(v) => update({ autoSend: v })}
          />
          <ToggleRow
            label="Send to Email"
            value={settings.sendToEmail}
            onValueChange={(v) => update({ sendToEmail: v })}
          />
          <ToggleRow
            label="Send to WhatsApp"
            value={settings.sendToWhatsApp}
            onValueChange={(v) => update({ sendToWhatsApp: v })}
          />
          <ToggleRow
            label="Auto-Delete after sending"
            subtitle="Clear local cache to save space"
            value={settings.autoDelete}
            onValueChange={(v) => update({ autoDelete: v })}
            showBorder={false}
          />
        </GlassCard>

        {/* PDF Engine */}
        <SectionLabel label="PDF Engine" />
        <GlassCard style={styles.card}>
          <RowItem
            icon="image-outline"
            label="Image Quality"
            value={settings.imageQuality === 'lossless' ? 'Lossless (Highest)' : settings.imageQuality === 'high' ? 'High' : 'Balanced'}
            onPress={() => {
              const options: ImageQuality[] = ['lossless', 'high', 'balanced'];
              const next = options[(options.indexOf(settings.imageQuality) + 1) % options.length];
              update({ imageQuality: next });
            }}
          />
          <RowItem
            icon="compress-outline"
            label="Compression"
            value="Intelligent Balancing"
            last
          />
        </GlassCard>

        {/* Appearance */}
        <SectionLabel label="Appearance" />
        <GlassCard style={styles.card}>
          <View style={styles.themeRow}>
            {([
              { mode: 'dark' as ThemeMode, label: 'Dark', icon: 'moon' },
              { mode: 'light' as ThemeMode, label: 'Light', icon: 'sunny' },
              { mode: 'system' as ThemeMode, label: 'System', icon: 'contrast' },
            ] as const).map((t) => (
              <ThemeButton
                key={t.mode}
                mode={t.mode}
                label={t.label}
                icon={t.icon}
                active={settings.theme === t.mode}
                onPress={() => update({ theme: t.mode })}
              />
            ))}
          </View>
        </GlassCard>

        {/* About */}
        <SectionLabel label="About" />
        <GlassCard style={styles.card}>
          <RowItem icon="document-text-outline" label="Privacy Policy" onPress={() => Alert.alert('Privacy', 'Documents never leave your device without your consent.')} />
          <RowItem icon="shield-checkmark-outline" label="Permissions" onPress={() => Alert.alert('Permissions', 'Camera, Media Library')} />
          <RowItem icon="information-circle-outline" label="App Version" value="1.0.0" last />
        </GlassCard>

        {/* Privacy badge */}
        <View style={[styles.privBadge, { backgroundColor: `${C.secondary}10`, borderColor: `${C.secondary}20` }]}>
          <Ionicons name="shield-checkmark" size={16} color={C.secondary} />
          <Text style={[styles.privBadgeText, { color: C.secondary }]}>PRIVACY-FIRST ARCHITECTURE</Text>
        </View>
        <Text style={[styles.version, { color: `${C.onSurfaceVariant}60` }]}>
          PrivacyScan v1.0.0 · On-Device Processing
        </Text>
      </ScrollView>

      {/* Edit Email Modal */}
      <Modal visible={editingEmail} transparent animationType="slide">
        <View style={[styles.modalBg, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <View style={[styles.modalCard, { backgroundColor: C.surfaceContainerHigh }]}>
            <Text style={[styles.modalTitle, { color: C.onSurface }]}>Email Address</Text>
            <View style={[styles.modalInput, { backgroundColor: C.surfaceContainer, borderColor: C.outlineVariant }]}>
              <Ionicons name="mail-outline" size={18} color={C.onSurfaceVariant} />
              <TextInput
                style={[styles.input, { color: C.onSurface }]}
                value={emailDraft}
                onChangeText={setEmailDraft}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
                placeholderTextColor={C.onSurfaceVariant}
                placeholder="your@email.com"
              />
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setEditingEmail(false)} style={[styles.modalCancel, { backgroundColor: C.surfaceContainer }]}>
                <Text style={{ color: C.onSurfaceVariant, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { update({ email: emailDraft }); setEditingEmail(false); }}
                style={[styles.modalSave, { backgroundColor: C.primary }]}
              >
                <Text style={{ color: C.onPrimary, fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit WhatsApp Modal */}
      <Modal visible={editingWA} transparent animationType="slide">
        <View style={[styles.modalBg, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <View style={[styles.modalCard, { backgroundColor: C.surfaceContainerHigh }]}>
            <Text style={[styles.modalTitle, { color: C.onSurface }]}>WhatsApp Number</Text>
            <View style={[styles.modalInput, { backgroundColor: C.surfaceContainer, borderColor: C.outlineVariant }]}>
              <Ionicons name="logo-whatsapp" size={18} color={C.onSurfaceVariant} />
              <TextInput
                style={[styles.input, { color: C.onSurface }]}
                value={waDraft}
                onChangeText={setWaDraft}
                keyboardType="phone-pad"
                autoFocus
                placeholderTextColor={C.onSurfaceVariant}
                placeholder="+1 555 0100"
              />
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setEditingWA(false)} style={[styles.modalCancel, { backgroundColor: C.surfaceContainer }]}>
                <Text style={{ color: C.onSurfaceVariant, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { update({ whatsapp: waDraft }); setEditingWA(false); }}
                style={[styles.modalSave, { backgroundColor: C.primary }]}
              >
                <Text style={{ color: C.onPrimary, fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },
  content: { paddingHorizontal: 20, gap: 10 },
  header: { gap: 4, marginBottom: 12 },
  pageTitle: { fontSize: 34, fontWeight: '700', letterSpacing: -0.5 },
  pageSub: { fontSize: 14, lineHeight: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  card: { marginBottom: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowText: { gap: 2, flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowValue: { fontSize: 13 },
  themeRow: { flexDirection: 'row', gap: 8, padding: 8 },
  themeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
  },
  themeBtnText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  privBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 12,
  },
  privBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  version: { fontSize: 12, textAlign: 'center', marginTop: 4 },
  // Modals
  modalBg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    gap: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  modalInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: { flex: 1, fontSize: 15 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalCancel: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSave: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
