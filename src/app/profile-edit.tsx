import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import AppButton from '@/components/common/AppButton';
import AppText from '@/components/common/AppText';
import AppTextInput from '@/components/common/AppTextInput';
import PhoneInput from '@/components/common/PhoneInput';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { useAuth } from '@/context/auth-context';
import { splitE164, toE164, validateName, validatePhone } from '@/lib/validation';
import { AuthError } from '@/services/auth-service';

type Errors = { name?: string; phone?: string; password?: string; form?: string };

export default function ProfileEditScreen() {
  const { user, updateProfile } = useAuth();
  const initial = splitE164(user?.phone ?? '');
  const [name, setName] = useState(user?.name ?? '');
  const [country, setCountry] = useState(initial.country);
  const [phone, setPhone] = useState(initial.national);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const phoneValid = !validatePhone(country, phone);
  const newPhone = phoneValid ? toE164(country, phone) : null;
  const phoneChanged = newPhone !== null && newPhone !== user.phone;
  const nameChanged = name.trim() !== user.name;

  const handleSave = async () => {
    const nextErrors: Errors = {
      name: validateName(name),
      phone: validatePhone(country, phone),
      password: phoneChanged && !password ? 'Nhập mật khẩu để xác nhận đổi số điện thoại.' : undefined,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean) || !newPhone) return;

    setSubmitting(true);
    try {
      await updateProfile({ name, phone: newPhone, password: phoneChanged ? password : undefined });
      router.back();
    } catch (error) {
      setErrors({
        form: error instanceof AuthError ? error.message : 'Cập nhật thất bại, vui lòng thử lại.',
      });
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Stack.Screen options={{ title: 'Chỉnh sửa thông tin' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {errors.form ? (
          <View style={styles.formError}>
            <AppText style={styles.formErrorText}>{errors.form}</AppText>
          </View>
        ) : null}

        <AppTextInput
          label="Họ tên"
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
        />

        {phoneChanged ? (
          <>
            <AppText style={styles.notice}>
              Số điện thoại dùng để đăng nhập. Sau khi đổi, bạn sẽ đăng nhập bằng số mới {newPhone}.
            </AppText>
            <AppTextInput
              label="Mật khẩu hiện tại"
              placeholder="Nhập mật khẩu để xác nhận"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </>
        ) : null}

        <AppButton
          title="Lưu thay đổi"
          onPress={handleSave}
          loading={submitting}
          disabled={!nameChanged && !phoneChanged}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  notice: {
    fontSize: 13,
    color: COLORS.textSecondary,
    backgroundColor: '#FDF6E3',
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
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
});
