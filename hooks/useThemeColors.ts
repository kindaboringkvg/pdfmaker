import { useColorScheme } from 'react-native';
import { Colors, ColorScheme } from '../constants/Colors';
import { useAppStore } from '../store/useAppStore';

export function useThemeColors(): ColorScheme {
  const systemScheme = useColorScheme();
  const theme = useAppStore((s) => s.settings.theme);

  if (theme === 'light') return Colors.light;
  if (theme === 'dark') return Colors.dark;
  return systemScheme === 'light' ? Colors.light : Colors.dark;
}
