import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import AppButton from '@/components/common/AppButton';
import AppText from '@/components/common/AppText';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { useAuth } from '@/context/auth-context';
import { getTemple } from '@/data/temples';
import { useTabInsets } from '@/hooks/use-tab-insets';
import { formatDateTime, formatVND } from '@/lib/format';
import { formatLunarShort, lunarDateOf } from '@/lib/lunar';
import { petitionSummary } from '@/lib/petition';
import { listOrders, type Order } from '@/services/order-service';

export default function OrdersScreen() {
  const { user } = useAuth();
  const insets = useTabInsets();
  const [orders, setOrders] = useState<Order[] | null>(null);

  // Reload whenever the tab gains focus so newly submitted offerings appear.
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      listOrders(user.id)
        .then((list) => active && setOrders(list))
        .catch(() => active && setOrders([]));
      return () => {
        active = false;
      };
    }, [user]),
  );

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
      data={orders ?? []}
      keyExtractor={(o) => o.id}
      ListHeaderComponent={<AppText style={styles.title}>Lễ đã dâng</AppText>}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => <OrderRow order={item} />}
      ListEmptyComponent={
        orders ? (
          <View style={styles.empty}>
            <AppText style={styles.emptyText}>Bạn chưa dâng lễ nào.</AppText>
            <AppButton title="Chọn chùa, đền" onPress={() => router.navigate('/')} />
          </View>
        ) : undefined
      }
    />
  );
}

function OrderRow({ order }: { order: Order }) {
  const temple = getTemple(order.templeId);
  const summary = [order.offeringName, order.petition && petitionSummary(order.petition)]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/order/[id]', params: { id: order.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      {temple ? <Image source={temple.image} style={styles.thumb} contentFit="cover" /> : null}
      <View style={styles.rowBody}>
        <AppText style={styles.rowTitle} numberOfLines={1}>
          {temple?.name ?? 'Không rõ'}
        </AppText>
        <AppText style={styles.rowSummary} numberOfLines={1}>
          {summary}
        </AppText>
        <AppText style={styles.rowDate}>
          {formatDateTime(order.createdAt)} · ÂL {formatLunarShort(lunarDateOf(new Date(order.createdAt)))}
        </AppText>
      </View>
      <AppText style={styles.rowPrice}>{formatVND(order.total)}</AppText>
    </Pressable>
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
    maxWidth: 720,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  separator: {
    height: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  pressed: {
    opacity: 0.8,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: COLORS.border,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontWeight: '700',
  },
  rowSummary: {
    fontSize: 14,
  },
  rowDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  rowPrice: {
    fontWeight: '700',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  empty: {
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  emptyText: {
    color: COLORS.textSecondary,
  },
});
