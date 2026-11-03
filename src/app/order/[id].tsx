import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppButton from '@/components/common/AppButton';
import AppText from '@/components/common/AppText';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { useAuth } from '@/context/auth-context';
import { getPetitionType } from '@/data/petitions';
import { getTemple } from '@/data/temples';
import { formatDateTime, formatVND } from '@/lib/format';
import { formatLunarDate, lunarDateOf } from '@/lib/lunar';
import { buildPetitionText } from '@/lib/petition';
import { getOrder, type Order } from '@/services/order-service';

export default function OrderScreen() {
  const { id, submitted } = useLocalSearchParams<{ id: string; submitted?: string }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    getOrder(user.id, id)
      .then((o) => setOrder(o ?? null))
      .catch(() => setOrder(null));
  }, [user, id]);

  const temple = getTemple(order?.templeId);

  if (order === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (!order || !temple) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Không tìm thấy' }} />
        <AppText>Không tìm thấy lễ này.</AppText>
      </View>
    );
  }

  const petitionType = getPetitionType(order.petition?.typeId);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: 'Chi tiết lễ' }} />
      <ScrollView contentContainerStyle={styles.content}>
        {submitted ? (
          <View style={styles.success}>
            <AppText style={styles.successTitle}>🙏 Đã gửi thành công</AppText>
            <AppText style={styles.successText}>
              {order.offeringName
                ? `Lễ của bạn sẽ được sắp và dâng tại ${temple.name}.`
                : `Sớ của bạn sẽ được dâng tại ${temple.name}.`}
            </AppText>
          </View>
        ) : null}

        <View style={styles.card}>
          <Image source={temple.image} style={styles.image} contentFit="cover" />
          <View style={styles.cardBody}>
            <AppText style={styles.templeName}>{temple.name}</AppText>
            <Row label="Thời gian" value={formatDateTime(order.createdAt)} />
            <Row
              label="Âm lịch"
              value={formatLunarDate(lunarDateOf(new Date(order.createdAt))).replace(/^ngày /, '')}
            />
            <Row label="Lễ" value={order.offeringName ?? 'Không sắp lễ'} />
            <Row label="Sớ" value={petitionType ? petitionType.name : 'Không viết sớ'} />
            <Row label="Trạng thái" value="Đã gửi" />
            <View style={styles.divider} />
            <Row label="Tổng cộng" value={formatVND(order.total)} strong />
          </View>
        </View>

        {order.petition ? (
          <>
            <AppText style={styles.section}>Nội dung sớ</AppText>
            <View style={styles.petition}>
              <AppText style={styles.petitionText}>
                {buildPetitionText(order.petition, temple, order.createdAt)}
              </AppText>
            </View>
          </>
        ) : null}
      </ScrollView>

      {submitted ? (
        <View style={[styles.bar, { paddingBottom: insets.bottom + SPACING.sm }]}>
          <AppButton title="Về trang chủ" onPress={() => router.dismissTo('/')} />
          <AppButton
            title="Xem lễ đã dâng"
            variant="outline"
            onPress={() => router.dismissTo('/orders')}
          />
        </View>
      ) : null}
    </View>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <AppText style={styles.rowLabel}>{label}</AppText>
      <AppText style={[styles.rowValue, strong && styles.rowStrong]}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  success: {
    backgroundColor: '#EAF3EC',
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.success,
  },
  successText: {
    marginTop: SPACING.xs,
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.border,
  },
  cardBody: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  templeName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  rowLabel: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  rowValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: 15,
  },
  rowStrong: {
    fontWeight: '700',
    fontSize: 18,
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  section: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  petition: {
    backgroundColor: '#FDF6E3',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    padding: SPACING.md,
  },
  petitionText: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  bar: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
});
