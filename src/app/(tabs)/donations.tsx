import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import AppButton from '@/components/common/AppButton';
import AppText from '@/components/common/AppText';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { useTabInsets } from '@/hooks/use-tab-insets';
import { formatISODate, formatVND, todayISODate } from '@/lib/format';
import { listDonations } from '@/services/donation-service';
import type { Donation } from '@/services/donation-types';

export default function DonationsScreen() {
  const insets = useTabInsets();
  const [query, setQuery] = useState('');
  const [donations, setDonations] = useState<Donation[] | null>(null);

  // Reload on focus (a receipt may have just been saved) and whenever the search changes.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      listDonations(query)
        .then((list) => active && setDonations(list))
        .catch(() => active && setDonations([]));
      return () => {
        active = false;
      };
    }, [query]),
  );

  const totals = useMemo(() => {
    const today = todayISODate();
    const month = today.slice(0, 7);
    let day = 0;
    let monthTotal = 0;
    for (const d of donations ?? []) {
      if (d.donationDate === today) day += d.amount;
      if (d.donationDate.startsWith(month)) monthTotal += d.amount;
    }
    return { day, month: monthTotal };
  }, [donations]);

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      data={donations ?? []}
      keyExtractor={(d) => d.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.header}>
          <AppText style={styles.title}>Sổ công đức</AppText>
          <AppButton title="📷  Chụp phiếu công đức" onPress={() => router.push('/donation/new')} />
          {!query ? (
            <View style={styles.stats}>
              <Stat label="Hôm nay" value={totals.day} />
              <Stat label="Tháng này" value={totals.month} />
            </View>
          ) : null}
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm theo tên, địa chỉ, số phiếu…"
            placeholderTextColor={COLORS.textSecondary}
            style={styles.search}
            clearButtonMode="while-editing"
          />
        </View>
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => <DonationRow donation={item} />}
      ListEmptyComponent={
        donations ? (
          <AppText style={styles.empty}>
            {query ? 'Không tìm thấy phiếu phù hợp.' : 'Chưa có phiếu nào. Hãy chụp phiếu đầu tiên.'}
          </AppText>
        ) : undefined
      }
    />
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <AppText style={styles.statLabel}>{label}</AppText>
      <AppText style={styles.statValue}>{formatVND(value)}</AppText>
    </View>
  );
}

function DonationRow({ donation }: { donation: Donation }) {
  const details = [donation.birthYear && `SN ${donation.birthYear}`, donation.address]
    .filter(Boolean)
    .join(' · ');
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/donation/[id]', params: { id: donation.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <View style={styles.rowBody}>
        <AppText style={styles.rowTitle} numberOfLines={1}>
          {donation.fullName}
        </AppText>
        {details ? (
          <AppText style={styles.rowDetails} numberOfLines={1}>
            {details}
          </AppText>
        ) : null}
        <AppText style={styles.rowDate}>
          {formatISODate(donation.donationDate)}
          {donation.receiptNumber ? ` · Phiếu ${donation.receiptNumber}` : ''}
        </AppText>
      </View>
      <AppText style={styles.rowAmount}>{formatVND(donation.amount)}</AppText>
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
  header: {
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  stats: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  stat: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    gap: 2,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  search: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.text,
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
    padding: 12,
  },
  pressed: {
    opacity: 0.8,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontWeight: '700',
  },
  rowDetails: {
    fontSize: 14,
  },
  rowDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  rowAmount: {
    fontWeight: '700',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  empty: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: SPACING.xl,
  },
});
