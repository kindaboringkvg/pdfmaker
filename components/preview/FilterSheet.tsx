import React, { useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  Image, Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ScanFilter } from '../../store/useAppStore';
import { useThemeColors } from '../../hooks/useThemeColors';

const { height: SCREEN_H } = Dimensions.get('window');

const FILTERS: { id: ScanFilter; label: string }[] = [
  { id: 'bw', label: 'B&W' },
  { id: 'color', label: 'Color' },
  { id: 'soft', label: 'Soft' },
  { id: 'photo', label: 'Photo' },
];

interface Props {
  visible: boolean;
  current: ScanFilter;
  onSelect: (f: ScanFilter) => void;
  onClose: () => void;
  imageUri?: string;
}

export function FilterSheet({ visible, current, onSelect, onClose, imageUri }: Props) {
  const C = useThemeColors();
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;

  React.useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : SCREEN_H,
      useNativeDriver: true,
      tension: 70,
      friction: 14,
    }).start();
  }, [visible]);

  const apply = (f: ScanFilter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(f);
    onClose();
  };

  return (
    <Animated.View
      style={[
        styles.sheet,
        {
          backgroundColor: C.surfaceContainerHigh,
          borderColor: C.glassBorder,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={[styles.handle, { backgroundColor: C.outlineVariant }]} />
      <Text style={[styles.title, { color: C.onSurface }]}>Choose Filter</Text>
      <View style={styles.grid}>
        {FILTERS.map((f) => {
          const isActive = f.id === current;
          return (
            <TouchableOpacity key={f.id} style={styles.filterItem} onPress={() => apply(f.id)} activeOpacity={0.8}>
              <View
                style={[
                  styles.thumb,
                  {
                    borderColor: isActive ? C.primary : C.outlineVariant,
                    borderWidth: isActive ? 2.5 : 1,
                    backgroundColor: C.surfaceContainer,
                  },
                ]}
              >
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={[
                      styles.thumbImage,
                      f.id === 'bw' && { tintColor: undefined },
                    ]}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.thumbImage, { backgroundColor: C.surfaceContainerHigh }]} />
                )}
              </View>
              <Text style={[styles.filterLabel, { color: isActive ? C.primary : C.onSurfaceVariant }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity style={[styles.applyBtn, { borderTopColor: C.outlineVariant }]} onPress={onClose}>
        <Text style={[styles.applyLabel, { color: C.primary }]}>Done</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    zIndex: 60,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterItem: {
    alignItems: 'center',
    gap: 8,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  applyBtn: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 16,
    alignItems: 'center',
  },
  applyLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
});
