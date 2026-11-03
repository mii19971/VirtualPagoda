import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from './AppText';
import { COLORS } from '../../constants/colors';
import { COUNTRIES, countryFlag, type Country } from '../../constants/countries';
import { SPACING } from '../../constants/spacing';
import { normalizeSearch } from '../../lib/format';

type PhoneInputProps = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string;
  country: Country;
  onCountryChange: (country: Country) => void;
};

export default function PhoneInput({
  label,
  error,
  country,
  onCountryChange,
  ...inputProps
}: PhoneInputProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = normalizeSearch(query).replace(/^\+/, '');
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        normalizeSearch(c.name).includes(q) ||
        c.code.toLowerCase() === q ||
        c.dialCode.startsWith(q),
    );
  }, [query]);

  const closePicker = () => {
    setPickerOpen(false);
    setQuery('');
  };

  const selectCountry = (next: Country) => {
    onCountryChange(next);
    closePicker();
  };

  return (
    <View style={styles.container}>
      <AppText style={styles.label}>{label}</AppText>
      <View style={[styles.field, error ? styles.fieldError : null]}>
        <Pressable
          onPress={() => setPickerOpen(true)}
          style={({ pressed }) => [styles.countryButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Mã quốc gia ${country.name} +${country.dialCode}, nhấn để đổi`}
        >
          <AppText style={styles.flag}>{countryFlag(country.code)}</AppText>
          <AppText style={styles.dialCode}>+{country.dialCode}</AppText>
          <AppText style={styles.chevron}>▾</AppText>
        </Pressable>
        <TextInput
          {...inputProps}
          placeholderTextColor={COLORS.textSecondary}
          style={styles.input}
        />
      </View>
      {error ? <AppText style={styles.error}>{error}</AppText> : null}

      <Modal
        visible={pickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closePicker}
      >
        <SafeAreaView style={styles.sheet} edges={['top', 'bottom']}>
          <View style={styles.sheetHeader}>
            <AppText style={styles.sheetTitle}>Chọn mã quốc gia</AppText>
            <Pressable onPress={closePicker} hitSlop={12} accessibilityRole="button">
              <AppText style={styles.close}>Đóng</AppText>
            </Pressable>
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm quốc gia hoặc mã vùng"
            placeholderTextColor={COLORS.textSecondary}
            autoCorrect={false}
            style={styles.search}
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const selected = item.code === country.code;
              return (
                <Pressable
                  onPress={() => selectCountry(item)}
                  style={({ pressed }) => [
                    styles.row,
                    selected && styles.rowSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText style={styles.flag}>{countryFlag(item.code)}</AppText>
                  <AppText style={styles.rowName} numberOfLines={1}>
                    {item.name}
                  </AppText>
                  <AppText style={styles.rowDial}>+{item.dialCode}</AppText>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <AppText style={styles.empty}>Không tìm thấy quốc gia phù hợp.</AppText>
            }
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  fieldError: {
    borderColor: COLORS.danger,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  pressed: {
    opacity: 0.6,
  },
  flag: {
    fontSize: 20,
  },
  dialCode: {
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
  chevron: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  error: {
    fontSize: 13,
    color: COLORS.danger,
    marginTop: SPACING.xs,
  },
  sheet: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  close: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  search: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  rowSelected: {
    backgroundColor: COLORS.surface,
  },
  rowName: {
    flex: 1,
  },
  rowDial: {
    color: COLORS.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  empty: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
  },
});
