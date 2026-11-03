import { Image } from 'expo-image';
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

/**
 * Shared shell for the login and register screens:
 * brand header (Dharma wheel logo, app name, tagline) above a bordered form card.
 */
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
        <View style={styles.brand}>
          <Image
            source={require('@/assets/images/logo.svg')}
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel="Logo Virtual Pagoda – bánh xe Pháp luân trên tòa sen"
          />
          <AppText style={styles.appName}>Virtual Pagoda</AppText>
          <AppText style={styles.tagline}>Không gian tâm linh số</AppText>
        </View>

        <View style={styles.card}>
          <AppText style={styles.title}>{title}</AppText>
          <AppText style={styles.subtitle}>{subtitle}</AppText>

          {formError ? (
            <View style={styles.formError}>
              <AppText style={styles.formErrorText}>{formError}</AppText>
            </View>
          ) : null}

          {children}

          {footer ? (
            <>
              <View style={styles.divider} />
              <View style={styles.footer}>{footer}</View>
            </>
          ) : null}
        </View>
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
  brand: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logo: {
    width: 96,
    height: 96,
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: SPACING.lg,
    // Soft elevation so the card lifts off the warm background.
    shadowColor: '#2D241E',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
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
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
});
