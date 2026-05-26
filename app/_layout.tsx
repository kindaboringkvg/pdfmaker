import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme, StyleSheet } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const theme = useAppStore((s) => s.settings.theme);
  const isDark = theme === 'dark' || (theme === 'system' && systemScheme !== 'light');
  const C = isDark ? Colors.dark : Colors.light;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="preview" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
