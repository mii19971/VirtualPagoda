import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import AppText from '@/components/common/AppText';
import { COLORS } from '@/constants/colors';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useConfirmSignOut } from '@/hooks/use-confirm-sign-out';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton>Chùa & Đền</TabButton>
          </TabTrigger>
          <TabTrigger name="orders" href="/orders" asChild>
            <TabButton>Lễ đã dâng</TabButton>
          </TabTrigger>
          <TabTrigger name="donations" href="/donations" asChild>
            <TabButton>Sổ công đức</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton>Tài khoản</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

// `ref` is typed for the trigger element, not Pressable; it isn't needed for a plain button.
export function TabButton({ children, isFocused, ref: _ref, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <View style={[styles.tabButtonView, isFocused && styles.tabButtonFocused]}>
        <AppText style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>{children}</AppText>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const confirmSignOut = useConfirmSignOut();
  return (
    <View {...props} style={styles.tabListContainer}>
      <View style={styles.innerContainer}>
        <AppText style={styles.brandText}>Chùa Nhà</AppText>
        {props.children}
        <View style={styles.separator} />
        <Pressable
          onPress={confirmSignOut}
          style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <AppText style={styles.signOutText}>Đăng xuất</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  brandText: {
    marginRight: 'auto',
    fontWeight: '700',
    color: COLORS.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
    marginHorizontal: Spacing.one,
  },
  signOut: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.danger,
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  tabButtonFocused: {
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  tabLabelFocused: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
