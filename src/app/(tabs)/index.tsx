import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import AppText from '@/components/common/AppText';
import Chip from '@/components/common/Chip';
import LunarTodayCard from '@/components/temple/LunarTodayCard';
import TempleCard from '@/components/temple/TempleCard';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { useAuth } from '@/context/auth-context';
import { KIND_LABELS, REGION_LABELS, TEMPLES, type Region } from '@/data/temples';
import { useConfirmSignOut } from '@/hooks/use-confirm-sign-out';
import { useTabInsets } from '@/hooks/use-tab-insets';
import { normalizeSearch } from '@/lib/format';

const REGION_FILTERS: { value: Region | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  ...(Object.entries(REGION_LABELS) as [Region, string][]).map(([value, label]) => ({ value, label })),
];

export default function TemplesScreen() {
  const { user } = useAuth();
  const confirmSignOut = useConfirmSignOut();
  const insets = useTabInsets();
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<Region | 'all'>('all');

  const temples = useMemo(() => {
    const q = normalizeSearch(query);
    return TEMPLES.filter(
      (t) =>
        (region === 'all' || t.region === region) &&
        (!q ||
          normalizeSearch(`${t.name} ${t.province} ${KIND_LABELS[t.kind]}`).includes(q)),
    );
  }, [query, region]);

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
      data={temples}
      keyExtractor={(t) => t.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.topRow}>
            <AppText style={styles.greeting} numberOfLines={1}>
              Xin chào, {user?.name}
            </AppText>
            <Pressable
              onPress={confirmSignOut}
              hitSlop={10}
              style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Đăng xuất"
            >
              <AppText style={styles.signOutText}>Đăng xuất</AppText>
            </Pressable>
          </View>
          <AppText style={styles.title}>Hôm nay bạn muốn dâng lễ ở đâu?</AppText>
          <LunarTodayCard />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm chùa, đền, tỉnh thành…"
            placeholderTextColor={COLORS.textSecondary}
            autoCorrect={false}
            returnKeyType="search"
            style={styles.search}
            accessibilityLabel="Tìm kiếm chùa, đền"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {REGION_FILTERS.map((f) => (
              <Chip
                key={f.value}
                label={f.label}
                selected={region === f.value}
                onPress={() => setRegion(f.value)}
              />
            ))}
          </ScrollView>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.cell}>
          <TempleCard
            temple={item}
            onPress={() => router.push({ pathname: '/temple/[id]', params: { id: item.id } })}
          />
        </View>
      )}
      ListEmptyComponent={
        <AppText style={styles.empty}>Không tìm thấy chùa hoặc đền phù hợp.</AppText>
      }
    />
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
    maxWidth: 900,
    alignSelf: 'center',
  },
  header: {
    marginBottom: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  greeting: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  signOut: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  pressed: {
    opacity: 0.6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  search: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  filters: {
    gap: SPACING.sm,
  },
  row: {
    gap: SPACING.md,
  },
  cell: {
    flex: 1 / 2,
    marginBottom: SPACING.md,
  },
  empty: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: SPACING.xl,
  },
});
