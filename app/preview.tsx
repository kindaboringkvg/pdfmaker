import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  ScrollView, Alert, ActivityIndicator, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as MailComposer from 'expo-mail-composer';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore, ScanFilter } from '../store/useAppStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { FilterSheet } from '../components/preview/FilterSheet';
import { SignatureOverlay } from '../components/preview/SignatureOverlay';

const { width: SCREEN_W } = Dimensions.get('window');
const DOC_W = SCREEN_W - 40;
const DOC_H = DOC_W * 1.414; // A4 ratio

const FILTER_LABELS: Record<ScanFilter, string> = {
  bw: 'B&W',
  color: 'COLOR',
  soft: 'SOFT',
  photo: 'PHOTO',
};

export default function PreviewScreen() {
  const C = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentPages, settings, setActiveFilter, activeFilter, clearCurrentPages, removePage } = useAppStore();

  const [pageIndex, setPageIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [sending, setSending] = useState(false);

  const currentPage = currentPages[pageIndex];

  const buildPdfHtml = useCallback(() => {
    const pages = currentPages.map((p) => {
      const imgStyle = p.filter === 'bw' ? 'filter: grayscale(100%) contrast(1.3);' : '';
      return `<div style="page-break-after:always;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#fff;">
        <img src="${p.uri}" style="max-width:100%;max-height:100%;object-fit:contain;${imgStyle}" />
      </div>`;
    });
    return `<!DOCTYPE html><html><body style="margin:0;padding:0;">${pages.join('')}</body></html>`;
  }, [currentPages]);

  const generatePdf = useCallback(async (): Promise<string> => {
    const { uri } = await Print.printToFileAsync({ html: buildPdfHtml(), base64: false });
    const dest = `${FileSystem.documentDirectory ?? ''}Scan_${Date.now()}.pdf`;
    await FileSystem.moveAsync({ from: uri, to: dest });
    return dest;
  }, [buildPdfHtml]);

  const handleSend = useCallback(async () => {
    if (currentPages.length === 0) return;
    setSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const pdfUri = await generatePdf();
      let sent = false;

      if (settings.sendToEmail && settings.email) {
        const available = await MailComposer.isAvailableAsync();
        if (available) {
          await MailComposer.composeAsync({
            recipients: [settings.email],
            subject: `Scan_${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}.pdf`,
            body: 'Your scanned document is attached.',
            attachments: [pdfUri],
          });
          sent = true;
        }
      }

      if (settings.sendToWhatsApp || !sent) {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(pdfUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Send via WhatsApp or any app',
          });
          sent = true;
        }
      }

      if (settings.autoDelete && sent) {
        await FileSystem.deleteAsync(pdfUri, { idempotent: true });
        clearCurrentPages();
        router.replace('/(tabs)/scanner');
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert('Send failed', 'Could not send the document. Please try again.');
    } finally {
      setSending(false);
    }
  }, [currentPages, settings, generatePdf, clearCurrentPages]);

  if (!currentPage) {
    return (
      <View style={[styles.root, { backgroundColor: C.background }]}>
        <Text style={{ color: C.onSurfaceVariant, marginTop: 100, alignSelf: 'center' }}>No pages scanned.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.primary} />
        </TouchableOpacity>
      </View>
    );
  }

  const filterStyle = currentPage.filter === 'bw'
    ? { tintColor: undefined, opacity: 1 }  // actual grayscale needs ImageManipulator
    : {};

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.topBtn, { backgroundColor: C.surfaceContainer }]}>
          <Ionicons name="arrow-back" size={20} color={C.primary} />
        </TouchableOpacity>
        <Text style={[styles.appTitle, { color: C.onSurface }]}>PrivacyScan</Text>
        <TouchableOpacity style={[styles.topBtn, { backgroundColor: C.surfaceContainer }]}>
          <Ionicons name="ellipsis-vertical" size={20} color={C.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 72 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Document canvas */}
        <View style={[styles.docContainer, { width: DOC_W, height: DOC_H, backgroundColor: C.surfaceContainerLow }]}>
          <Image
            source={{ uri: currentPage.uri }}
            style={[styles.docImage, currentPage.filter === 'bw' && styles.grayscale]}
            resizeMode="contain"
          />
          {/* Corner handles */}
          {['TL', 'TR', 'BL', 'BR'].map((pos) => (
            <View
              key={pos}
              style={[
                styles.corner,
                styles[`corner${pos}` as keyof typeof styles] as any,
                { borderColor: `${C.primary}60` },
              ]}
            />
          ))}
          {/* Filter badge */}
          <View style={[styles.filterBadge, { backgroundColor: `${C.surface}CC`, borderColor: 'rgba(255,255,255,0.12)' }]}>
            <Text style={[styles.filterBadgeText, { color: C.primary }]}>
              ENHANCED · {FILTER_LABELS[currentPage.filter]}
            </Text>
          </View>
        </View>

        {/* Page indicator */}
        {currentPages.length > 1 && (
          <View style={styles.pageDots}>
            {currentPages.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setPageIndex(i)}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: i === pageIndex ? C.primary : C.outlineVariant },
                    i === pageIndex && styles.dotActive,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 260 }} />
      </ScrollView>

      {/* Bottom action sheet */}
      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 16, backgroundColor: `${C.surfaceContainerHighest}F0`, borderTopColor: C.glassBorder }]}>
        {/* Quick actions */}
        <View style={[styles.quickActions, { backgroundColor: `${C.surfaceContainer}90`, borderColor: C.glassBorder }]}>
          {[
            { icon: 'refresh-outline', label: 'Retake', onPress: () => { removePage(currentPage.id); if (currentPages.length <= 1) router.back(); } },
            { icon: 'crop-outline', label: 'Crop', onPress: () => Alert.alert('Crop', 'Drag the handles to crop your scan.') },
            { icon: 'color-filter-outline', label: 'Filter', onPress: () => setShowFilters(true) },
            { icon: 'create-outline', label: 'Sign', onPress: () => setShowSignature(true) },
          ].map((action) => (
            <TouchableOpacity key={action.label} style={styles.quickBtn} onPress={action.onPress} activeOpacity={0.75}>
              <Ionicons name={action.icon as any} size={24} color={C.onSurfaceVariant} />
              <Text style={[styles.quickLabel, { color: C.onSurfaceVariant }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Send CTA */}
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: C.primaryContainer }]}
          onPress={handleSend}
          activeOpacity={0.9}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color={C.onPrimaryContainer} />
          ) : (
            <>
              <View style={[styles.sendIcon, { backgroundColor: `${C.onPrimaryContainer}18` }]}>
                <Ionicons name="send" size={20} color={C.onPrimaryContainer} />
              </View>
              <View>
                <Text style={[styles.sendLabel, { color: C.onPrimaryContainer }]}>Send Automatically</Text>
                <Text style={[styles.sendSub, { color: `${C.onPrimaryContainer}90` }]}>
                  {[settings.sendToEmail && 'Email', settings.sendToWhatsApp && 'WhatsApp'].filter(Boolean).join(' & ') || 'Configure in Settings'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={`${C.onPrimaryContainer}60`} style={{ marginLeft: 'auto' }} />
            </>
          )}
        </TouchableOpacity>

        {/* Privacy note */}
        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark" size={12} color={C.secondary} />
          <Text style={[styles.privacyText, { color: C.secondary }]}>ON-DEVICE · AUTO-DELETE AFTER SEND</Text>
        </View>
      </View>

      {/* Filter sheet */}
      <FilterSheet
        visible={showFilters}
        current={activeFilter}
        onSelect={(f) => setActiveFilter(f)}
        onClose={() => setShowFilters(false)}
        imageUri={currentPage.uri}
      />

      {/* Signature overlay */}
      <SignatureOverlay
        visible={showSignature}
        onDone={() => { setShowSignature(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}
        onCancel={() => setShowSignature(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 10,
  },
  topBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: { fontSize: 18, fontWeight: '700' },
  backBtn: { position: 'absolute', top: 60, left: 20 },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 20,
    gap: 16,
  },
  docContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  docImage: { width: '100%', height: '100%' },
  grayscale: { opacity: 0.95 }, // real grayscale needs ImageManipulator
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderWidth: 2,
  },
  cornerTL: { top: 12, left: 12, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 3 },
  cornerTR: { top: 12, right: 12, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 3 },
  cornerBL: { bottom: 12, left: 12, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 3 },
  cornerBR: { bottom: 12, right: 12, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 3 },
  filterBadge: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  pageDots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { width: 18 },
  bottomSheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  quickActions: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    padding: 8,
  },
  quickBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  quickLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.4 },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
  },
  sendIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sendLabel: { fontSize: 16, fontWeight: '700' },
  sendSub: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingBottom: 4,
  },
  privacyText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
});
