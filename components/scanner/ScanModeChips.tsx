import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ScanMode } from '../../store/useAppStore';
import { useThemeColors } from '../../hooks/useThemeColors';

const MODES: { id: ScanMode; label: string }[] = [
  { id: 'document', label: 'DOCUMENT' },
  { id: 'id', label: 'ID CARD' },
  { id: 'qr', label: 'QR CODE' },
];

interface Props {
  active: ScanMode;
  onChange: (mode: ScanMode) => void;
}

export function ScanModeChips({ active, onChange }: Props) {
  const C = useThemeColors();

  const handleChange = (mode: ScanMode) => {
    Haptics.selectionAsync();
    onChange(mode);
  };

  return (
    <View style={[styles.container, { backgroundColor: `${C.surfaceContainer}70`, borderColor: `${C.outlineVariant}50` }]}>
      {MODES.map((m) => {
        const isActive = m.id === active;
        return (
          <TouchableOpacity
            key={m.id}
            activeOpacity={0.85}
            onPress={() => handleChange(m.id)}
            style={[
              styles.chip,
              isActive && { backgroundColor: C.primary },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? C.onPrimary : C.onSurfaceVariant },
              ]}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: 1,
    padding: 4,
    gap: 2,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
