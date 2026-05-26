import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useThemeColors';

function TabIcon({ name, focused, color }: { name: any; focused: boolean; color: any }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconActive]}>
      <Ionicons name={focused ? name : `${name}-outline` as any} size={22} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const C = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.tabBar,
          borderTopColor: C.glassBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          position: 'absolute',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          elevation: 0,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: C.primary as string,
        tabBarInactiveTintColor: C.onSurfaceVariant as string,
      }}
    >
      <Tabs.Screen
        name="scanner"
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon name="camera" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon name="document-text" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon name="time" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon name="options" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  iconActive: {
    backgroundColor: 'rgba(133,173,255,0.15)',
  },
});
