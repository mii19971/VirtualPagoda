import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import AppButton from '@/components/common/AppButton';
import AppText from '@/components/common/AppText';
import AppTextInput from '@/components/common/AppTextInput';
import PhoneInput from '@/components/common/PhoneInput';
import AuthForm from '@/components/auth/AuthForm';
import { COLORS } from '@/constants/colors';
import { DEFAULT_COUNTRY } from '@/constants/countries';
import { useAuth } from '@/context/auth-context';
import { toE164, validatePhone } from '@/lib/validation';
import { AuthError } from '@/services/auth-service';

type Errors = { phone?: string; password?: string; form?: string };

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const nextErrors: Errors = {
      phone: validatePhone(country, phone),
      password: password ? undefined : 'Vui lòng nhập mật khẩu.',
    };
    setErrors(nextErrors);
    if (nextErrors.phone || nextErrors.password) return;

    setSubmitting(true);
    try {
      // On success the root layout's Stack.Protected guard switches to the tabs.
      await signIn(toE164(country, phone), password);
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
      subtitle="Chào mừng bạn trở lại Virtual Pagoda."
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
        returnKeyType="next"
      />
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
      <AppButton title="Đăng nhập" onPress={handleSubmit} loading={submitting} />
    </AuthForm>
  );
}

const styles = StyleSheet.create({
  footerText: {
    color: COLORS.textSecondary,
  },
  link: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
