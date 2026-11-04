import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// The web tab bar (app-tabs.web.tsx) floats over the top of the content.
const WEB_TAB_BAR_HEIGHT = 88;

/** Padding that keeps tab-screen content clear of the status bar and the tab bar. */
export function useTabInsets() {
  const insets = useSafeAreaInsets();
  if (Platform.OS === 'web') {
    return { top: WEB_TAB_BAR_HEIGHT, bottom: insets.bottom + 16 };
  }
  // On native the JS tab bar sits below the content and handles the bottom safe area itself.
  return { top: insets.top + 8, bottom: 16 };
}
