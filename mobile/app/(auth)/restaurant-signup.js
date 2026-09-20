import { useState } from 'react';
import { router } from 'expo-router';
import { AuthHeader } from '../../components/AuthHeader';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';

const initial = {
  ownerName: '', email: '', phone: '', password: '', confirmPassword: '',
  restaurantName: '', description: '', cuisines: '', restaurantPhone: '',
  addressLine: '', area: '', city: 'Nepalgunj', landmark: '', latitude: '28.0507', longitude: '81.6167',
  openingTime: '09:00', closingTime: '21:00',
};

export default function RestaurantSignupScreen() {
  const { registerRestaurant } = useAuth();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const update = (field) => (value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      await registerRestaurant({
        ...form,
        cuisines: form.cuisines.split(',').map((item) => item.trim()).filter(Boolean),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      });
      router.replace('/');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboard>
      <AuthHeader eyebrow="PARTNER WITH US" title="Bring your kitchen online." subtitle="Applications are reviewed before a restaurant can receive orders." />
      <FeedbackBanner message={error} />
      <FormField label="Owner name" value={form.ownerName} onChangeText={update('ownerName')} autoCapitalize="words" />
      <FormField label="Owner email" value={form.email} onChangeText={update('email')} keyboardType="email-address" />
      <FormField label="Owner phone" value={form.phone} onChangeText={update('phone')} keyboardType="phone-pad" />
      <FormField label="Password" value={form.password} onChangeText={update('password')} secureTextEntry />
      <FormField label="Confirm password" value={form.confirmPassword} onChangeText={update('confirmPassword')} secureTextEntry />
      <FormField label="Restaurant name" value={form.restaurantName} onChangeText={update('restaurantName')} autoCapitalize="words" />
      <FormField label="Description" value={form.description} onChangeText={update('description')} multiline />
      <FormField label="Cuisines (comma separated)" value={form.cuisines} onChangeText={update('cuisines')} placeholder="Nepali, Momo, Newari" />
      <FormField label="Restaurant phone" value={form.restaurantPhone} onChangeText={update('restaurantPhone')} keyboardType="phone-pad" />
      <FormField label="Street address" value={form.addressLine} onChangeText={update('addressLine')} autoCapitalize="words" />
      <FormField label="Area" value={form.area} onChangeText={update('area')} autoCapitalize="words" />
      <FormField label="City" value={form.city} onChangeText={update('city')} autoCapitalize="words" />
      <FormField label="Nearby landmark" value={form.landmark} onChangeText={update('landmark')} autoCapitalize="sentences" />
      <FormField label="Latitude" value={form.latitude} onChangeText={update('latitude')} keyboardType="decimal-pad" />
      <FormField label="Longitude" value={form.longitude} onChangeText={update('longitude')} keyboardType="decimal-pad" />
      <FormField label="Opening time (24h)" value={form.openingTime} onChangeText={update('openingTime')} placeholder="09:00" />
      <FormField label="Closing time (24h)" value={form.closingTime} onChangeText={update('closingTime')} placeholder="21:00" />
      <PrimaryButton title="Submit restaurant application" onPress={submit} loading={loading} />
    </Screen>
  );
}

