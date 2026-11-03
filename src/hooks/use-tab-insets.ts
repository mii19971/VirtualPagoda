import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset } from '@/constants/theme';

// The web tab bar (app-tabs.web.tsx) floats over the top of the content.
const WEB_TAB_BAR_HEIGHT = 88;

/** Padding that keeps tab-screen content clear of the status bar and the tab bar. */
export function useTabInsets() {
  const insets = useSafeAreaInsets();
  return {
    top: Platform.OS === 'web' ? WEB_TAB_BAR_HEIGHT : insets.top + 8,
    bottom: insets.bottom + BottomTabInset + 16,
  };
}
