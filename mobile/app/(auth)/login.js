import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { AuthHeader } from '../../components/AuthHeader';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { colors, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!emailOrPhone.trim() || !password) return setError('Enter your email or phone and password.');
    setError('');
    setLoading(true);
    try {
      await login({ emailOrPhone, password });
      router.replace('/');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboard>
      <AuthHeader title="Local food, delivered with clarity." subtitle="Sign in to order from kitchens around Nepalgunj." />
      <FeedbackBanner message={error} />
      <FormField
        label="Email or Nepal phone"
        value={emailOrPhone}
        onChangeText={setEmailOrPhone}
        placeholder="you@example.com or 98XXXXXXXX"
        keyboardType="email-address"
        autoComplete="username"
      />
      <FormField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        secureTextEntry
        autoComplete="password"
      />
      <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgot}>
        <Text style={styles.link}>Forgot password?</Text>
      </Pressable>
      <PrimaryButton title="Sign in" onPress={handleLogin} loading={loading} />
      <View style={styles.signupRow}>
        <Text style={styles.muted}>New to nepalgungdaba? </Text>
        <Link href="/(auth)/signup" style={styles.link}>Create an account</Link>
      </View>
      <View style={styles.partnerBox}>
        <Text style={styles.partnerTitle}>Work with us</Text>
        <Link href="/(auth)/restaurant-signup" style={styles.partnerLink}>Register a restaurant</Link>
        <Link href="/(auth)/rider-signup" style={styles.partnerLink}>Apply as a rider</Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  forgot: { alignSelf: 'flex-end', marginBottom: spacing.lg },
  link: { color: colors.primary, fontWeight: '800' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  muted: { color: colors.muted },
  partnerBox: { marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.md },
  partnerTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  partnerLink: { color: colors.leaf, fontWeight: '800' },
});

