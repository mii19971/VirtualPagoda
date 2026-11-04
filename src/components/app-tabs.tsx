import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { COLORS } from '@/constants/colors';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

// JS tabs rather than NativeTabs: in Expo Go on Android the native tab bar showed only the
// selected tab's label (Material Symbols icons did not load), so the other tabs looked missing.
// The icon font ships with the app, and every tab always shows its label.
function tabIcon(name: IconName) {
  return function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    // The tab bar passes the resolved tint color string.
    return <MaterialIcons name={name} color={color as string} size={size} />;
  };
}

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Chùa & Đền', tabBarIcon: tabIcon('temple-buddhist') }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: 'Lễ đã dâng', tabBarIcon: tabIcon('receipt-long') }}
      />
      <Tabs.Screen
        name="donations"
        options={{ title: 'Sổ công đức', tabBarIcon: tabIcon('menu-book') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Tài khoản', tabBarIcon: tabIcon('account-circle') }}
      />
    </Tabs>
  );
}
