import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Link, router } from 'expo-router';
import { AuthHeader } from '../../components/AuthHeader';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { colors, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const initialForm = { fullName: '', phone: '', email: '', password: '', confirmPassword: '' };

export default function SignupScreen() {
  const { registerCustomer } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const update = (field) => (value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async () => {
    if (Object.values(form).some((value) => !value.trim())) return setError('Complete every required field.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    setError('');
    try {
      await registerCustomer(form);
      router.replace('/');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboard>
      <AuthHeader title="Your next meal starts here." subtitle="Create a customer account for Nepalgunj delivery." />
      <FeedbackBanner message={error} />
      <FormField label="Full name" value={form.fullName} onChangeText={update('fullName')} autoCapitalize="words" autoComplete="name" />
      <FormField label="Nepal phone" value={form.phone} onChangeText={update('phone')} keyboardType="phone-pad" placeholder="98XXXXXXXX" autoComplete="tel" />
      <FormField label="Email" value={form.email} onChangeText={update('email')} keyboardType="email-address" autoComplete="email" />
      <FormField label="Password" value={form.password} onChangeText={update('password')} secureTextEntry autoComplete="new-password" placeholder="8+ characters, upper, lower, number, symbol" />
      <FormField label="Confirm password" value={form.confirmPassword} onChangeText={update('confirmPassword')} secureTextEntry autoComplete="new-password" />
      <PrimaryButton title="Create customer account" onPress={submit} loading={loading} />
      <Text style={styles.signin}>Already registered? <Link href="/(auth)/login" style={styles.link}>Sign in</Link></Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  signin: { color: colors.muted, textAlign: 'center', marginTop: spacing.lg },
  link: { color: colors.primary, fontWeight: '800' },
});

