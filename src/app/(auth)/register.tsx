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
import { toE164, validateName, validatePassword, validatePhone } from '@/lib/validation';
import { AuthError } from '@/services/auth-service';

type Errors = {
  name?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const nextErrors: Errors = {
      name: validateName(name),
      phone: validatePhone(country, phone),
      password: validatePassword(password),
      confirmPassword:
        confirmPassword === password ? undefined : 'Mật khẩu xác nhận không khớp.',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      // New accounts are signed in immediately; the root guard then shows the tabs.
      await signUp(name, toE164(country, phone), password);
    } catch (error) {
      setErrors({
        form: error instanceof AuthError ? error.message : 'Tạo tài khoản thất bại, vui lòng thử lại.',
      });
      setSubmitting(false);
    }
  };

  return (
    <AuthForm
      title="Tạo tài khoản"
      subtitle="Tham gia không gian tâm linh số."
      formError={errors.form}
      footer={
        <>
          <AppText style={styles.footerText}>Đã có tài khoản? </AppText>
          <Link href="/login" replace>
            <AppText style={styles.link}>Đăng nhập</AppText>
          </Link>
        </>
      }
    >
      <AppTextInput
        label="Họ tên"
        placeholder="Nguyễn Văn A"
        value={name}
        onChangeText={setName}
        error={errors.name}
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
      />
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
        placeholder="Ít nhất 6 ký tự"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
      />
      <AppTextInput
        label="Xác nhận mật khẩu"
        placeholder="Nhập lại mật khẩu"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={errors.confirmPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />
      <AppButton title="Tạo tài khoản" onPress={handleSubmit} loading={submitting} />
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
