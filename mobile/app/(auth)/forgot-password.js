import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Link } from 'expo-router';
import { AuthHeader } from '../../components/AuthHeader';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { colors, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordScreen() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: 'error' });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim()) return setFeedback({ message: 'Enter your account email.', type: 'error' });
    setLoading(true);
    try {
      const response = await forgotPassword(email);
      setFeedback({ message: response.message, type: 'success' });
    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboard>
      <AuthHeader title="Reset your password." subtitle="We’ll send instructions if the email belongs to an account." />
      <FeedbackBanner {...feedback} />
      <FormField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" />
      <PrimaryButton title="Send reset instructions" onPress={submit} loading={loading} />
      <Text style={styles.back}><Link href="/(auth)/login" style={styles.link}>Back to sign in</Link></Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { textAlign: 'center', marginTop: spacing.lg },
  link: { color: colors.primary, fontWeight: '800' },
});

