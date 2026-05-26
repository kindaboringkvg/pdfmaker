import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore, ScannedPage } from '../../store/useAppStore';
import { useThemeColors } from '../../hooks/useThemeColors';

function ScanCard({ page, onDelete }: { page: ScannedPage; onDelete: () => void }) {
  const C = useThemeColors();
  const date = new Date(page.timestamp);
  const label = date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.card, { backgroundColor: C.surfaceContainer, borderColor: C.glassBorder }]}>
      <View style={[styles.thumb, { backgroundColor: C.surfaceContainerHigh }]}>
        <Image source={{ uri: page.uri }} style={styles.thumbImg} resizeMode="cover" />
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: C.onSurface }]}>
          Scan_{date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}.pdf
        </Text>
        <Text style={[styles.cardDate, { color: C.onSurfaceVariant }]}>{label}</Text>
        <View style={[styles.filterPill, { backgroundColor: `${C.primary}18`, borderColor: `${C.primary}30` }]}>
          <Text style={[styles.filterPillText, { color: C.primary }]}>{page.filter.toUpperCase()}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.deleteBtn, { backgroundColor: `${C.error}15` }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Alert.alert('Delete scan?', 'This action cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: onDelete },
          ]);
        }}
      >
        <Ionicons name="trash-outline" size={18} color={C.error} />
      </TouchableOpacity>
    </View>
  );
}

export default function HistoryScreen() {
  const C = useThemeColors();
  const insets = useSafeAreaInsets();
  const { scannedPages, removePage } = useAppStore();

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <LinearGradient colors={[`${C.primary}10`, 'transparent']} style={styles.gradient} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.headTitle, { color: C.primary }]}>History</Text>
        <Text style={[styles.headSub, { color: C.onSurfaceVariant }]}>
          {scannedPages.length} scan{scannedPages.length !== 1 ? 's' : ''} this session
        </Text>
      </View>

      {scannedPages.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: `${C.primary}12`, borderColor: `${C.primary}20` }]}>
            <Ionicons name="time-outline" size={48} color={C.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: C.onSurface }]}>No scans yet</Text>
          <Text style={[styles.emptySub, { color: C.onSurfaceVariant }]}>
            Scan a document and it will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={scannedPages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          renderItem={({ item }) => (
            <ScanCard page={item} onDelete={() => removePage(item.id)} />
          )}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 4,
  },
  headTitle: { fontSize: 34, fontWeight: '700', letterSpacing: -0.5 },
  headSub: { fontSize: 14 },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  thumb: {
    width: 58,
    height: 58,
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  cardInfo: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 14, fontWeight: '600' },
  cardDate: { fontSize: 12 },
  filterPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 2,
  },
  filterPillText: { fontSize: 10, fontWeight: '700' },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 22, fontWeight: '700' },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
