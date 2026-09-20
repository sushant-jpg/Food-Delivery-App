import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { AuthHeader } from '../../components/AuthHeader';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const { resetPassword } = useAuth();
  const [token, setToken] = useState(typeof params.token === 'string' ? params.token : '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!token || !password || !confirmPassword) return setError('Complete every field.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    setError('');
    try {
      await resetPassword({ token, password, confirmPassword });
      router.replace('/');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboard>
      <AuthHeader title="Choose a new password." subtitle="Reset links expire after 15 minutes for your security." />
      <FeedbackBanner message={error} />
      <FormField label="Reset token" value={token} onChangeText={setToken} autoCapitalize="none" />
      <FormField label="New password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
      <FormField label="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoComplete="new-password" />
      <PrimaryButton title="Reset password" onPress={submit} loading={loading} />
    </Screen>
  );
}

