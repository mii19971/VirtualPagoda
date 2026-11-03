import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import AppText from '../common/AppText';
import AppTextInput from '../common/AppTextInput';
import Chip from '../common/Chip';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { RELATIONS, type RelationId } from '../../data/petitions';
import type { PetitionPerson } from '../../services/order-service';

export type PersonErrors = { name?: string; birthYear?: string };

type PersonEditorProps = {
  person: PetitionPerson;
  title: string;
  /** Whether the "Bản thân" relation may be picked (only one person can be the user). */
  allowSelf: boolean;
  canRemove: boolean;
  errors?: PersonErrors;
  onChange: (patch: Partial<PetitionPerson>) => void;
  onRemove: () => void;
};

export default function PersonEditor({
  person,
  title,
  allowSelf,
  canRemove,
  errors,
  onChange,
  onRemove,
}: PersonEditorProps) {
  const relations = RELATIONS.filter((r) => r.id !== 'self' || allowSelf || person.relation === 'self');

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AppText style={styles.title}>{title}</AppText>
        {canRemove ? (
          <Pressable onPress={onRemove} hitSlop={10} accessibilityRole="button">
            <AppText style={styles.remove}>Xóa</AppText>
          </Pressable>
        ) : null}
      </View>

      <AppText style={styles.label}>Quan hệ với bạn</AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.relations}
        keyboardShouldPersistTaps="handled"
      >
        {relations.map((r) => (
          <Chip
            key={r.id}
            label={r.label}
            selected={person.relation === r.id}
            onPress={() => onChange({ relation: r.id as RelationId })}
          />
        ))}
      </ScrollView>

      <AppTextInput
        label="Họ tên"
        placeholder="VD: Nguyễn Văn A"
        value={person.name}
        onChangeText={(name) => onChange({ name })}
        error={errors?.name}
        returnKeyType="next"
      />
      <AppTextInput
        label="Năm sinh (không bắt buộc)"
        placeholder="VD: 1960"
        value={person.birthYear ?? ''}
        onChangeText={(birthYear) => onChange({ birthYear: birthYear.replace(/\D/g, '') })}
        error={errors?.birthYear}
        keyboardType="number-pad"
        maxLength={4}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    paddingBottom: 0,
    marginBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontWeight: '700',
  },
  remove: {
    color: COLORS.danger,
    fontWeight: '600',
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  relations: {
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
  },
});
