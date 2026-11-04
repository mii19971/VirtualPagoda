import { NativeTabs } from 'expo-router/native-tabs';

import { COLORS } from '@/constants/colors';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={COLORS.surface}
      indicatorColor={COLORS.border}
      tintColor={COLORS.primary}
      // Android hides unselected labels once there are 4+ tabs; always show them.
      labelVisibilityMode="labeled"
      labelStyle={{ selected: { color: COLORS.primary } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Chùa & Đền</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="building.columns.fill" md="temple_buddhist" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="orders">
        <NativeTabs.Trigger.Label>Lễ đã dâng</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="list.bullet.rectangle.fill" md="receipt_long" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="donations">
        <NativeTabs.Trigger.Label>Sổ công đức</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="book.closed.fill" md="menu_book" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Tài khoản</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle.fill" md="account_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
