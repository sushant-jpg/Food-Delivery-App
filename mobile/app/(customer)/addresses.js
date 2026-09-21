import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { PageHeader } from '../../components/PageHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { StatePanel } from '../../components/StatePanel';
import { colors, radii, spacing } from '../../constants/theme';
import { api, getApiErrorMessage } from '../../services/api';

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/addresses');
      setAddresses(response.data.data.addresses);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const setDefault = async (id) => {
    try {
      await api.patch(`/addresses/${id}/default`);
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const remove = (address) => {
    Alert.alert('Delete address?', `${address.label} will be removed from your saved locations.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/addresses/${address._id}`);
            await load();
          } catch (requestError) {
            setError(getApiErrorMessage(requestError));
          }
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <PageHeader title="Delivery addresses" subtitle="Your default address powers distance and delivery pricing." />
      {loading ? <StatePanel loading title="Loading addresses" /> : null}
      {!loading && error ? <StatePanel title="Couldn’t load addresses" message={error} actionLabel="Retry" onAction={load} /> : null}
      {!loading && !error && addresses.length === 0 ? (
        <StatePanel title="No saved address" message="Pin your first Nepalgunj delivery location." />
      ) : null}
      <View style={styles.list}>
        {addresses.map((address) => (
          <View key={address._id} style={[styles.card, address.isDefault && styles.defaultCard]}>
            <View style={styles.titleRow}>
              <Text style={styles.label}>{address.label}</Text>
              {address.isDefault ? <Text style={styles.badge}>DEFAULT</Text> : null}
            </View>
            <Text style={styles.primary}>{address.addressLine}</Text>
            <Text style={styles.secondary}>{address.area}, Nepalgunj{address.ward ? ` · Ward ${address.ward}` : ''}</Text>
            <Text style={styles.secondary}>Near {address.landmark}</Text>
            <View style={styles.actions}>
              {!address.isDefault ? (
                <Pressable onPress={() => setDefault(address._id)}><Text style={styles.action}>Make default</Text></Pressable>
              ) : null}
              <Pressable onPress={() => remove(address)}><Text style={styles.delete}>Delete</Text></Pressable>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.add}><PrimaryButton title="Add a new address" onPress={() => router.push('/(customer)/location')} /></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: spacing.lg },
  defaultCard: { borderColor: colors.leaf, borderWidth: 2 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: colors.ink, fontSize: 19, fontWeight: '900' },
  badge: { color: colors.leaf, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  primary: { color: colors.ink, fontWeight: '700', marginTop: spacing.sm },
  secondary: { color: colors.muted, marginTop: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md },
  action: { color: colors.primary, fontWeight: '800' },
  delete: { color: colors.danger, fontWeight: '800' },
  add: { marginTop: spacing.lg },
});

