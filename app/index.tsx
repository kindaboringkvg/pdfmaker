import { Redirect } from 'expo-router';
import { useAppStore } from '../store/useAppStore';

export default function Index() {
  const onboardingComplete = useAppStore((s) => s.settings.onboardingComplete);
  return onboardingComplete ? <Redirect href="/(tabs)/scanner" /> : <Redirect href="/onboarding" />;
}
