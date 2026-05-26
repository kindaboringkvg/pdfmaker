import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  rounded?: number;
}

export function GlassCard({ children, style, rounded = 16 }: GlassCardProps) {
  const C = useThemeColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: C.glassPanel,
          borderColor: C.glassBorder,
          borderRadius: rounded,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});
