import { ScrollView, StyleSheet, View } from 'react-native';
import AppButton from '@/components/common/AppButton';
import AppText from '@/components/common/AppText';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { useAuth } from '@/context/auth-context';
import { useTabInsets } from '@/hooks/use-tab-insets';
import { formatDateTime } from '@/lib/format';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const insets = useTabInsets();
  if (!user) return null;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <AppText style={styles.title}>Tài khoản</AppText>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <AppText style={styles.avatarText}>{user.name.trim().charAt(0).toUpperCase()}</AppText>
        </View>
        <AppText style={styles.name}>{user.name}</AppText>
        <AppText style={styles.muted}>{user.phone}</AppText>
        <AppText style={styles.muted}>Tham gia từ {formatDateTime(user.createdAt).split(' ')[0]}</AppText>
      </View>

      <View style={styles.signOut}>
        <AppButton title="Đăng xuất" variant="outline" onPress={signOut} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: SPACING.md,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  card: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  muted: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  signOut: {
    marginTop: SPACING.lg,
  },
});
