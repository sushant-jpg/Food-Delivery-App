import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { FormField } from '../../components/FormField';
import { PageHeader } from '../../components/PageHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { StatePanel } from '../../components/StatePanel';
import { colors, radii, spacing } from '../../constants/theme';
import { api, getApiErrorMessage } from '../../services/api';

export default function RestaurantProfileScreen() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const restaurant = (await api.get('/restaurants/me')).data.data.restaurant;
      setForm({
        name: restaurant.name,
        description: restaurant.description,
        cuisines: restaurant.cuisines.join(', '),
        phone: restaurant.phone,
        image: restaurant.image || '',
        coverImage: restaurant.coverImage || '',
        addressLine: restaurant.addressLine,
        area: restaurant.area,
        landmark: restaurant.landmark,
        longitude: String(restaurant.location.coordinates[0]),
        latitude: String(restaurant.location.coordinates[1]),
        openingTime: restaurant.openingTime,
        closingTime: restaurant.closingTime,
        minimumOrder: String(restaurant.minimumOrder || 0),
        isAcceptingOrders: restaurant.isAcceptingOrders,
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);
  const update = (field) => (value) => setForm((current) => ({ ...current, [field]: value }));

  const save = async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await api.patch('/restaurants/me', {
        ...form,
        cuisines: form.cuisines.split(',').map((item) => item.trim()).filter(Boolean),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        minimumOrder: Number(form.minimumOrder),
      });
      setNotice('Restaurant profile updated.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Screen><StatePanel loading title="Loading profile" /></Screen>;
  if (!form) return <Screen><StatePanel title="Profile unavailable" message={error} actionLabel="Retry" onAction={load} /></Screen>;

  return (
    <Screen scroll keyboard>
      <PageHeader title="Restaurant profile" subtitle="Customer-facing details, hours, and map location." />
      <FeedbackBanner message={error} />
      <FeedbackBanner message={notice} type="success" />
      <View style={styles.switchRow}>
        <View style={styles.switchCopy}>
          <Text style={styles.switchTitle}>Accepting orders</Text>
          <Text style={styles.switchSubtitle}>Turn this off when the kitchen needs to pause.</Text>
        </View>
        <Switch value={form.isAcceptingOrders} onValueChange={update('isAcceptingOrders')} trackColor={{ true: colors.leaf }} />
      </View>
      <FormField label="Restaurant name" value={form.name} onChangeText={update('name')} autoCapitalize="words" />
      <FormField label="Description" value={form.description} onChangeText={update('description')} multiline autoCapitalize="sentences" />
      <FormField label="Cuisines (comma separated)" value={form.cuisines} onChangeText={update('cuisines')} autoCapitalize="words" />
      <FormField label="Phone" value={form.phone} onChangeText={update('phone')} keyboardType="phone-pad" />
      <FormField label="Image URL" value={form.image} onChangeText={update('image')} keyboardType="url" />
      <FormField label="Cover image URL" value={form.coverImage} onChangeText={update('coverImage')} keyboardType="url" />
      <FormField label="Address line" value={form.addressLine} onChangeText={update('addressLine')} autoCapitalize="words" />
      <FormField label="Area" value={form.area} onChangeText={update('area')} autoCapitalize="words" />
      <FormField label="Landmark" value={form.landmark} onChangeText={update('landmark')} autoCapitalize="sentences" />
      <View style={styles.row}>
        <View style={styles.half}><FormField label="Latitude" value={form.latitude} onChangeText={update('latitude')} keyboardType="decimal-pad" /></View>
        <View style={styles.half}><FormField label="Longitude" value={form.longitude} onChangeText={update('longitude')} keyboardType="decimal-pad" /></View>
      </View>
      <View style={styles.row}>
        <View style={styles.half}><FormField label="Opening (HH:mm)" value={form.openingTime} onChangeText={update('openingTime')} /></View>
        <View style={styles.half}><FormField label="Closing (HH:mm)" value={form.closingTime} onChangeText={update('closingTime')} /></View>
      </View>
      <FormField label="Minimum order (Rs)" value={form.minimumOrder} onChangeText={update('minimumOrder')} keyboardType="decimal-pad" />
      <PrimaryButton title="Save restaurant profile" onPress={save} loading={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  switchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.lg },
  switchCopy: { flex: 1, paddingRight: spacing.md },
  switchTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  switchSubtitle: { color: colors.muted, marginTop: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
});
