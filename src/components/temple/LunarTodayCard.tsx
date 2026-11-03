import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from '../common/AppText';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import {
  canChiOfDay,
  canChiOfYear,
  lunarDateOf,
  lunarDayName,
  lunarMonthName,
} from '../../lib/lunar';

const DAY_MS = 24 * 3600 * 1000;

/** Days until the next mùng 1 or rằm (15th), the traditional days for visiting temples. */
function nextHolyDay(now: Date): { days: number; label: string } {
  for (let i = 1; i <= 30; i++) {
    const lunar = lunarDateOf(new Date(now.getTime() + i * DAY_MS));
    if (lunar.day === 1 || lunar.day === 15) {
      return { days: i, label: lunarDayName(lunar.day, true) };
    }
  }
  return { days: 0, label: '' };
}

export default function LunarTodayCard() {
  const now = new Date();
  const lunar = lunarDateOf(now);
  const isHolyDay = lunar.day === 1 || lunar.day === 15;
  const next = nextHolyDay(now);

  return (
    <View style={[styles.card, isHolyDay && styles.holy]}>
      <View style={styles.dayBox}>
        <AppText style={styles.dayNumber}>{lunar.day}</AppText>
        <AppText style={styles.dayCaption}>âm lịch</AppText>
      </View>
      <View style={styles.body}>
        <AppText style={styles.title}>
          Tháng {lunarMonthName(lunar)} năm {canChiOfYear(lunar.year)}
        </AppText>
        <AppText style={styles.muted}>Ngày {canChiOfDay(lunar)}</AppText>
        <AppText style={[styles.note, isHolyDay && styles.holyNote]}>
          {isHolyDay
            ? `Hôm nay là ${lunarDayName(lunar.day, true)}, ngày tốt để dâng hương.`
            : `Còn ${next.days} ngày nữa đến ${next.label}.`}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: SPACING.md,
  },
  holy: {
    borderColor: COLORS.secondary,
    backgroundColor: '#FDF6E3',
  },
  dayBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 30,
  },
  dayCaption: {
    color: '#FFFFFF',
    fontSize: 11,
    opacity: 0.85,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontWeight: '700',
  },
  muted: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  note: {
    fontSize: 13,
    marginTop: 2,
  },
  holyNote: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
