import React, { useRef } from 'react';
import { Animated, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../../hooks/useThemeColors';

interface ShutterButtonProps {
  onPress: () => void;
}

export function ShutterButton({ onPress }: ShutterButtonProps) {
  const C = useThemeColors();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }),
    ]).start();
    onPress();
  };

  return (
    <View style={styles.wrapper}>
      {/* Outer ring */}
      <View style={[styles.outerRing, { borderColor: 'rgba(255,255,255,0.35)' }]} />
      {/* Shutter */}
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handlePress}
          style={[
            styles.shutter,
            {
              backgroundColor: C.primary,
              shadowColor: C.primary,
            },
          ]}
        >
          <View style={[styles.innerRing, { borderColor: `${C.onPrimary}25` }]}>
            <Ionicons name="camera" size={28} color={C.onPrimary} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
  },
  shutter: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  innerRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
