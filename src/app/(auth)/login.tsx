import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import AppButton from '@/components/common/AppButton';
import AppText from '@/components/common/AppText';
import AppTextInput from '@/components/common/AppTextInput';
import AuthForm from '@/components/auth/AuthForm';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/context/auth-context';
import { validateEmail } from '@/lib/validation';
import { AuthError } from '@/services/auth-service';

type Errors = { email?: string; password?: string; form?: string };

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const nextErrors: Errors = {
      email: validateEmail(email),
      password: password ? undefined : 'Vui lòng nhập mật khẩu.',
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setSubmitting(true);
    try {
      // On success the root layout's Stack.Protected guard switches to the tabs.
      await signIn(email, password);
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
      <AppTextInput
        label="Email"
        placeholder="ban@example.com"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
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
