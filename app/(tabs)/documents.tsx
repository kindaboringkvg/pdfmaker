import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useAppStore } from '../../store/useAppStore';

export default function DocumentsScreen() {
  const C = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const currentPages = useAppStore((s) => s.currentPages);

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <LinearGradient colors={[`${C.secondary}0D`, 'transparent']} style={styles.gradient} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: C.primary }]}>Documents</Text>
        <Text style={[styles.sub, { color: C.onSurfaceVariant }]}>Current session</Text>
      </View>

      {currentPages.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: `${C.primary}12`, borderColor: `${C.primary}25` }]}>
            <Ionicons name="document-text-outline" size={52} color={C.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: C.onSurface }]}>No active document</Text>
          <Text style={[styles.emptySub, { color: C.onSurfaceVariant }]}>
            Scan pages using the camera tab. They'll appear here ready to preview and send.
          </Text>
          <TouchableOpacity
            style={[styles.scanBtn, { backgroundColor: C.primary }]}
            onPress={() => router.push('/(tabs)/scanner')}
          >
            <Ionicons name="camera" size={18} color={C.onPrimary} />
            <Text style={[styles.scanBtnText, { color: C.onPrimary }]}>Start Scanning</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.docReady}>
          <View style={[styles.readyCard, { backgroundColor: C.surfaceContainer, borderColor: `${C.primary}30` }]}>
            <Ionicons name="document-text" size={36} color={C.primary} />
            <View style={styles.readyInfo}>
              <Text style={[styles.readyTitle, { color: C.onSurface }]}>
                {currentPages.length} page{currentPages.length !== 1 ? 's' : ''} ready
              </Text>
              <Text style={[styles.readySub, { color: C.onSurfaceVariant }]}>Tap to preview and send</Text>
            </View>
            <TouchableOpacity
              style={[styles.previewBtn, { backgroundColor: C.primaryContainer }]}
              onPress={() => router.push('/preview')}
            >
              <Text style={[styles.previewBtnText, { color: C.onPrimaryContainer }]}>Review →</Text>
            </TouchableOpacity>
          </View>

          {/* Privacy note */}
          <View style={[styles.privNote, { backgroundColor: `${C.secondary}10`, borderColor: `${C.secondary}20` }]}>
            <Ionicons name="shield-checkmark" size={14} color={C.secondary} />
            <Text style={[styles.privText, { color: C.secondary }]}>
              Pages exist only in local cache. Auto-deleted after sending.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 180 },
  header: { paddingHorizontal: 24, paddingBottom: 16, gap: 4 },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -0.5 },
  sub: { fontSize: 14 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 36,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 22, fontWeight: '700' },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 4,
  },
  scanBtnText: { fontSize: 16, fontWeight: '700' },
  docReady: { flex: 1, padding: 20, gap: 16 },
  readyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  readyInfo: { flex: 1, gap: 3 },
  readyTitle: { fontSize: 17, fontWeight: '700' },
  readySub: { fontSize: 13 },
  previewBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  previewBtnText: { fontSize: 14, fontWeight: '700' },
  privNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  privText: { flex: 1, fontSize: 13, lineHeight: 19 },
});
