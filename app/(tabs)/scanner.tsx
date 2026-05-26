import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  Image, Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store/useAppStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { EdgeOverlay } from '../../components/scanner/EdgeOverlay';
import { ShutterButton } from '../../components/scanner/ShutterButton';
import { ScanModeChips } from '../../components/scanner/ScanModeChips';

export default function ScannerScreen() {
  const C = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const flashAnim = useRef(new Animated.Value(0)).current;

  const {
    isAutoScanEnabled, isFlashEnabled, activeScanMode, currentPages,
    setAutoScan, setFlash, setActiveScanMode, addPage, clearCurrentPages,
  } = useAppStore();

  const triggerFlash = useCallback(() => {
    flashAnim.setValue(1);
    Animated.timing(flashAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start();
  }, []);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      triggerFlash();
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.95, base64: false });
      if (!photo) return;
      addPage({
        id: Date.now().toString(),
        uri: photo.uri,
        filter: 'bw',
        timestamp: Date.now(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert('Capture failed', 'Could not take photo. Please try again.');
    }
  }, [triggerFlash, addPage]);

  const handleReviewPages = () => {
    if (currentPages.length === 0) return;
    router.push('/preview');
  };

  if (!permission) return <View style={[styles.root, { backgroundColor: C.background }]} />;

  if (!permission.granted) {
    return (
      <View style={[styles.permRoot, { backgroundColor: C.background }]}>
        <LinearGradient colors={[`${C.primary}15`, 'transparent']} style={StyleSheet.absoluteFill} />
        <Ionicons name="camera-outline" size={72} color={C.primary} />
        <Text style={[styles.permTitle, { color: C.onSurface }]}>Camera Access Required</Text>
        <Text style={[styles.permSub, { color: C.onSurfaceVariant }]}>
          PrivacyScan needs camera access to scan your documents.
        </Text>
        <TouchableOpacity
          style={[styles.permBtn, { backgroundColor: C.primary }]}
          onPress={requestPermission}
        >
          <Text style={[styles.permBtnText, { color: C.onPrimary }]}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Camera viewfinder */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={isFlashEnabled ? 'on' : 'off'}
      />

      {/* Edge detection overlay */}
      <EdgeOverlay />

      {/* Top gradient */}
      <LinearGradient
        colors={['rgba(2,10,47,0.75)', 'transparent']}
        style={[styles.topGrad, { height: insets.top + 80 }]}
      />

      {/* Bottom gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(2,10,47,0.95)']}
        style={styles.bottomGrad}
      />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => { setFlash(!isFlashEnabled); Haptics.selectionAsync(); }}
        >
          <Ionicons
            name={isFlashEnabled ? 'flash' : 'flash-off'}
            size={22}
            color="white"
          />
        </TouchableOpacity>
        <Text style={styles.appTitle}>PrivacyScan</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(tabs)/settings')}>
          <Ionicons name="settings-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Auto-scan badge */}
      <View style={[styles.badge, { backgroundColor: `${C.surfaceContainer}85`, borderColor: 'rgba(255,255,255,0.1)' }]}>
        <View style={[styles.badgeDot, { backgroundColor: isAutoScanEnabled ? C.secondary : C.outline }]} />
        <Text style={styles.badgeText}>
          Auto-Scan: {isAutoScanEnabled ? 'ON' : 'OFF'}
        </Text>
      </View>

      {/* Bottom controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 80 }]}>
        {/* Scan mode chips */}
        <ScanModeChips active={activeScanMode} onChange={setActiveScanMode} />

        {/* Controls row */}
        <View style={styles.shutterRow}>
          {/* Gallery / current pages preview */}
          <TouchableOpacity
            style={[styles.galleryBtn, { borderColor: 'rgba(255,255,255,0.25)' }]}
            onPress={handleReviewPages}
            activeOpacity={0.8}
          >
            {currentPages.length > 0 ? (
              <>
                <Image source={{ uri: currentPages[currentPages.length - 1].uri }} style={styles.thumbImg} />
                <View style={[styles.pageCount, { backgroundColor: C.primary }]}>
                  <Text style={[styles.pageCountText, { color: C.onPrimary }]}>{currentPages.length}</Text>
                </View>
              </>
            ) : (
              <Ionicons name="images-outline" size={22} color="rgba(255,255,255,0.6)" />
            )}
          </TouchableOpacity>

          {/* Shutter */}
          <ShutterButton onPress={handleCapture} />

          {/* Auto/manual toggle */}
          <TouchableOpacity
            style={[
              styles.autoBtn,
              { backgroundColor: `${C.surfaceContainer}80`, borderColor: 'rgba(255,255,255,0.12)' },
              isAutoScanEnabled && { backgroundColor: `${C.primaryContainer}50` },
            ]}
            onPress={() => { setAutoScan(!isAutoScanEnabled); Haptics.selectionAsync(); }}
          >
            <Ionicons name="sparkles-outline" size={22} color={isAutoScanEnabled ? C.primary : 'rgba(255,255,255,0.6)'} />
          </TouchableOpacity>
        </View>

        {/* Review button when pages captured */}
        {currentPages.length > 0 && (
          <TouchableOpacity
            style={[styles.reviewBtn, { backgroundColor: C.primaryContainer }]}
            onPress={handleReviewPages}
            activeOpacity={0.9}
          >
            <Text style={[styles.reviewBtnText, { color: C.onPrimaryContainer }]}>
              Review {currentPages.length} page{currentPages.length !== 1 ? 's' : ''} →
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[styles.flashOverlay, { opacity: flashAnim }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'black' },
  permRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  permTitle: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  permSub: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  permBtn: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  permBtnText: { fontSize: 16, fontWeight: '700' },
  topGrad: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bottomGrad: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 340,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  appTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  badge: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    zIndex: 10,
  },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: {
    color: 'rgba(225,228,255,0.9)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
    gap: 24,
    zIndex: 10,
  },
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
  },
  galleryBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  thumbImg: { width: '100%', height: '100%' },
  pageCount: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageCountText: { fontSize: 10, fontWeight: '800' },
  autoBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  reviewBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
  },
  reviewBtnText: { fontSize: 15, fontWeight: '700' },
  flashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'white',
    zIndex: 100,
  },
});
