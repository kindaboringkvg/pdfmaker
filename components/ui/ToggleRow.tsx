import React from 'react';
import { View, Text, Switch, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

interface ToggleRowProps {
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  style?: ViewStyle;
  showBorder?: boolean;
}

export function ToggleRow({ label, subtitle, value, onValueChange, style, showBorder = true }: ToggleRowProps) {
  const C = useThemeColors();
  return (
    <View
      style={[
        styles.row,
        showBorder && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.outlineVariant },
        style,
      ]}
    >
      <View style={styles.text}>
        <Text style={[styles.label, { color: C.onSurface }]}>{label}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: C.onSurfaceVariant }]}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={value ? C.onPrimary : C.onSurface}
        trackColor={{ false: C.surfaceContainerHighest, true: C.primary }}
        ios_backgroundColor={C.surfaceContainerHighest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});
