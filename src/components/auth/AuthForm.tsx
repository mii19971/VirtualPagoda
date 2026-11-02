import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import AppText from '../common/AppText';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';

type AuthFormProps = {
  title: string;
  subtitle: string;
  formError?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

// Shared shell for the login and register screens.
export default function AuthForm({ title, subtitle, formError, children, footer }: AuthFormProps) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <AppText style={styles.title}>{title}</AppText>
          <AppText style={styles.subtitle}>{subtitle}</AppText>

          {formError ? (
            <View style={styles.formError}>
              <AppText style={styles.formErrorText}>{formError}</AppText>
            </View>
          ) : null}

          {children}
        </View>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  formError: {
    backgroundColor: '#FBEAEA',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  formErrorText: {
    color: COLORS.danger,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
});
