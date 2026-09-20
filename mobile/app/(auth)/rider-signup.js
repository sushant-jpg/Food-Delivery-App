import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AuthHeader } from '../../components/AuthHeader';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { colors, radii, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const initial = {
  fullName: '', email: '', phone: '', password: '', confirmPassword: '', vehicleType: 'bike',
  vehicleNumber: '', drivingLicenseNumber: '', currentAddress: '', city: 'Nepalgunj',
};

export default function RiderSignupScreen() {
  const { registerRider } = useAuth();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const update = (field) => (value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      await registerRider(form);
      router.replace('/');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboard>
      <AuthHeader eyebrow="RIDE WITH US" title="Deliver around Nepalgunj." subtitle="Rider applications require admin approval before going online." />
      <FeedbackBanner message={error} />
      <FormField label="Full name" value={form.fullName} onChangeText={update('fullName')} autoCapitalize="words" />
      <FormField label="Email" value={form.email} onChangeText={update('email')} keyboardType="email-address" />
      <FormField label="Phone" value={form.phone} onChangeText={update('phone')} keyboardType="phone-pad" />
      <FormField label="Password" value={form.password} onChangeText={update('password')} secureTextEntry />
      <FormField label="Confirm password" value={form.confirmPassword} onChangeText={update('confirmPassword')} secureTextEntry />
      <Text style={styles.label}>Vehicle type</Text>
      <View style={styles.options}>
        {['bike', 'scooter', 'bicycle'].map((type) => (
          <Pressable key={type} onPress={() => update('vehicleType')(type)} style={[styles.option, form.vehicleType === type && styles.optionActive]}>
            <Text style={[styles.optionText, form.vehicleType === type && styles.optionTextActive]}>{type}</Text>
          </Pressable>
        ))}
      </View>
      <FormField label="Vehicle number" value={form.vehicleNumber} onChangeText={update('vehicleNumber')} autoCapitalize="characters" />
      {form.vehicleType !== 'bicycle' ? <FormField label="Driving license number" value={form.drivingLicenseNumber} onChangeText={update('drivingLicenseNumber')} autoCapitalize="characters" /> : null}
      <FormField label="Current address" value={form.currentAddress} onChangeText={update('currentAddress')} autoCapitalize="words" />
      <FormField label="City" value={form.city} onChangeText={update('city')} autoCapitalize="words" />
      <PrimaryButton title="Submit rider application" onPress={submit} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.ink, fontSize: 14, fontWeight: '700', marginBottom: spacing.sm },
  options: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  option: { flex: 1, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, alignItems: 'center', backgroundColor: colors.surface },
  optionActive: { backgroundColor: colors.leaf, borderColor: colors.leaf },
  optionText: { color: colors.ink, fontWeight: '700', textTransform: 'capitalize' },
  optionTextActive: { color: '#FFFFFF' },
});

