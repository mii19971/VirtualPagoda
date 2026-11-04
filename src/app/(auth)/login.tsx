import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import AppButton from '@/components/common/AppButton';
import AppText from '@/components/common/AppText';
import AppTextInput from '@/components/common/AppTextInput';
import PhoneInput from '@/components/common/PhoneInput';
import AuthForm from '@/components/auth/AuthForm';
import { COLORS } from '@/constants/colors';
import { DEFAULT_COUNTRY } from '@/constants/countries';
import { SPACING } from '@/constants/spacing';
import { useAuth } from '@/context/auth-context';
import { toE164, validatePhone } from '@/lib/validation';
import { AuthError } from '@/services/auth-service';

/** The only number that signs in with a password; every other number signs in as a guest. */
const MEMBER_PHONE_E164 = toE164(DEFAULT_COUNTRY, '0392899081');

type Errors = { phone?: string; password?: string; form?: string };

export default function LoginScreen() {
  const { signIn, signInAsGuest } = useAuth();
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  // "Khách" is derived from the phone number: unchecked (password required) only for the member number.
  const isGuest = toE164(country, phone) !== MEMBER_PHONE_E164;

  const handleSubmit = async () => {
    const nextErrors: Errors = {
      phone: validatePhone(country, phone),
      password: isGuest || password ? undefined : 'Vui lòng nhập mật khẩu.',
    };
    setErrors(nextErrors);
    if (nextErrors.phone || nextErrors.password) return;

    setSubmitting(true);
    try {
      // On success the root layout's Stack.Protected guard switches to the tabs.
      const e164 = toE164(country, phone);
      await (isGuest ? signInAsGuest(e164) : signIn(e164, password));
    } catch (error) {
      setErrors({
        form: error instanceof AuthError ? error.message : 'Đăng nhập thất bại, vui lòng thử lại.',
      });
      setSubmitting(false);
    }
  };

  return (
    <AuthForm
      title="Đăng nhập"
      subtitle="Đăng nhập bằng số điện thoại của bạn."
      formError={errors.form}
      footer={
        <>
          <AppText style={styles.footerText}>Chưa có tài khoản? </AppText>
          <Link href="/register" replace>
            <AppText style={styles.link}>Tạo tài khoản</AppText>
          </Link>
        </>
      }
    >
      <PhoneInput
        label="Số điện thoại"
        country={country}
        onCountryChange={setCountry}
        placeholder="912 345 678"
        value={phone}
        onChangeText={setPhone}
        error={errors.phone}
        autoComplete="tel"
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        returnKeyType={isGuest ? 'done' : 'next'}
        onSubmitEditing={isGuest ? handleSubmit : undefined}
      />
      {/* Read-only: the user cannot toggle it, it follows the phone number. */}
      <Pressable
        style={styles.checkboxRow}
        disabled
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isGuest, disabled: true }}
      >
        <MaterialIcons
          name={isGuest ? 'check-box' : 'check-box-outline-blank'}
          size={22}
          color={isGuest ? COLORS.primary : COLORS.textSecondary}
        />
        <AppText style={styles.checkboxLabel}>Khách</AppText>
      </Pressable>
      {isGuest ? null : (
        <AppTextInput
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      )}
      <AppButton title="Đăng nhập" onPress={handleSubmit} loading={submitting} />
    </AuthForm>
  );
}

const styles = StyleSheet.create({
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  checkboxLabel: {
    fontSize: 15,
  },
  footerText: {
    color: COLORS.textSecondary,
  },
  link: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
