import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

export function EdgeOverlay() {
  const C = useThemeColors();
  const scanLineY = useRef(new Animated.Value(0)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, { toValue: 1, duration: 3500, useNativeDriver: true }),
        Animated.timing(scanLineY, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 0.5, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const cornerColor = C.primary;
  const CORNER = 24;
  const BORDER = 3;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.overlay,
          {
            borderColor: `${cornerColor}60`,
            backgroundColor: `${cornerColor}12`,
            opacity: pulseOpacity,
          },
        ]}
      >
        {/* Corners */}
        <View style={[styles.cornerTL, { borderColor: cornerColor, width: CORNER, height: CORNER, borderTopWidth: BORDER, borderLeftWidth: BORDER }]} />
        <View style={[styles.cornerTR, { borderColor: cornerColor, width: CORNER, height: CORNER, borderTopWidth: BORDER, borderRightWidth: BORDER }]} />
        <View style={[styles.cornerBL, { borderColor: cornerColor, width: CORNER, height: CORNER, borderBottomWidth: BORDER, borderLeftWidth: BORDER }]} />
        <View style={[styles.cornerBR, { borderColor: cornerColor, width: CORNER, height: CORNER, borderBottomWidth: BORDER, borderRightWidth: BORDER }]} />

        {/* Scan line */}
        <Animated.View
          style={[
            styles.scanLine,
            {
              backgroundColor: `${C.primary}60`,
              shadowColor: C.primary,
              transform: [
                {
                  translateY: scanLineY.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-1, 260],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  overlay: {
    width: '82%',
    height: '60%',
    borderWidth: 1.5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cornerTL: { position: 'absolute', top: -1.5, left: -1.5, borderTopLeftRadius: 4 },
  cornerTR: { position: 'absolute', top: -1.5, right: -1.5, borderTopRightRadius: 4 },
  cornerBL: { position: 'absolute', bottom: -1.5, left: -1.5, borderBottomLeftRadius: 4 },
  cornerBR: { position: 'absolute', bottom: -1.5, right: -1.5, borderBottomRightRadius: 4 },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});
