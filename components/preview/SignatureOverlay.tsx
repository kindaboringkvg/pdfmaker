import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  PanResponder, Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../../hooks/useThemeColors';

const { height: SCREEN_H } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onDone: () => void;
  onCancel: () => void;
}

export function SignatureOverlay({ visible, onDone, onCancel }: Props) {
  const C = useThemeColors();
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const [paths, setPaths] = useState<string[]>([]);
  const currentPath = useRef('');
  const isDrawing = useRef(false);

  React.useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : SCREEN_H,
      useNativeDriver: true,
      tension: 60,
      friction: 14,
    }).start();
    if (visible) setPaths([]);
  }, [visible]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      currentPath.current = `M${locationX},${locationY}`;
      isDrawing.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    onPanResponderMove: (e) => {
      if (!isDrawing.current) return;
      const { locationX, locationY } = e.nativeEvent;
      currentPath.current += ` L${locationX},${locationY}`;
      setPaths((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = currentPath.current;
        return updated;
      });
    },
    onPanResponderRelease: () => {
      isDrawing.current = false;
      setPaths((prev) => [...prev, '']);
    },
  });

  return (
    <Animated.View
      style={[
        styles.overlay,
        { backgroundColor: `${C.background}F5`, transform: [{ translateY }] },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.headerBtn}>
          <Text style={[styles.headerBtnText, { color: C.onSurfaceVariant }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: C.onSurface }]}>Sign Document</Text>
        <TouchableOpacity onPress={onDone} style={styles.headerBtn}>
          <Text style={[styles.headerBtnText, { color: C.primary, fontWeight: '700' }]}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Drawing canvas */}
      <View
        style={[styles.canvas, { borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow }]}
        {...panResponder.panHandlers}
      >
        <Svg style={StyleSheet.absoluteFill}>
          {paths.filter(Boolean).map((d, i) => (
            <Path key={i} d={d} stroke={C.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </Svg>
        {paths.every((p) => !p) && (
          <Text style={[styles.hint, { color: C.onSurfaceVariant }]}>Draw your signature here</Text>
        )}
        {/* Signature line */}
        <View style={[styles.signLine, { backgroundColor: `${C.outlineVariant}60` }]} />
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[styles.toolBtn, { backgroundColor: C.surfaceContainer, borderColor: C.glassBorder }]}
          onPress={() => {
            setPaths((prev) => prev.slice(0, -2));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Text style={{ fontSize: 18 }}>↩</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.clearBtn, { backgroundColor: C.surfaceContainer, borderColor: C.glassBorder }]}
          onPress={() => {
            setPaths([]);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <Text style={[styles.clearText, { color: C.error }]}>Clear All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolBtn, { backgroundColor: C.primaryContainer, borderColor: C.glassBorder }]}
          onPress={onDone}
        >
          <Text style={{ fontSize: 18, color: C.onPrimaryContainer }}>✓</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    zIndex: 80,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerBtn: { padding: 8 },
  headerBtnText: { fontSize: 16 },
  title: { fontSize: 18, fontWeight: '600' },
  canvas: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: 13,
    letterSpacing: 0.5,
    opacity: 0.5,
    position: 'absolute',
    bottom: '40%',
  },
  signLine: {
    position: 'absolute',
    bottom: '38%',
    left: 20,
    right: 20,
    height: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 24,
  },
  toolBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtn: {
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: { fontSize: 14, fontWeight: '600' },
});
