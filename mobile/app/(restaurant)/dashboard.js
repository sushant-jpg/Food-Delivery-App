import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { StatePanel } from '../../components/StatePanel';
import { colors, radii, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api, getApiErrorMessage } from '../../services/api';

export default function RestaurantDashboard() {
  const { logout } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [profileResponse, menuResponse] = await Promise.all([api.get('/restaurants/me'), api.get('/menu')]);
      setRestaurant(profileResponse.data.data.restaurant);
      setMenu(menuResponse.data.data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <Screen><StatePanel loading title="Loading restaurant portal" /></Screen>;
  if (error) return <Screen><StatePanel title="Couldn’t load restaurant" message={error} actionLabel="Retry" onAction={load} /></Screen>;

  const itemCount = menu?.categories.reduce((total, category) => total + category.items.length, 0) || 0;

  return (
    <Screen scroll>
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>RESTAURANT PORTAL</Text>
          <Text style={styles.title}>{restaurant?.name}</Text>
          <Text style={styles.area}>{restaurant?.area}, Nepalgunj</Text>
        </View>
        <Pressable onPress={logout}><Text style={styles.logout}>Sign out</Text></Pressable>
      </View>
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>ORDER STATUS</Text>
        <Text style={styles.statusValue}>{restaurant?.isAcceptingOrders ? 'Accepting orders' : 'Paused'}</Text>
        <Text style={styles.schedule}>{restaurant?.openingTime}–{restaurant?.closingTime} · {restaurant?.cuisines.join(', ')}</Text>
      </View>
      <View style={styles.metrics}>
        <View style={styles.metric}><Text style={styles.metricValue}>{menu?.categories.length || 0}</Text><Text style={styles.metricLabel}>Categories</Text></View>
        <View style={styles.metric}><Text style={styles.metricValue}>{itemCount}</Text><Text style={styles.metricLabel}>Menu items</Text></View>
      </View>
      <View style={styles.actions}>
        <PrimaryButton title="Edit restaurant profile" onPress={() => router.push('/(restaurant)/profile')} />
        <PrimaryButton title="Manage menu" variant="secondary" onPress={() => router.push('/(restaurant)/menu')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  copy: { flex: 1 },
  eyebrow: { color: colors.leaf, fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: colors.ink, fontSize: 30, fontWeight: '900', marginTop: spacing.xs },
  area: { color: colors.muted, marginTop: spacing.xs },
  logout: { color: colors.primary, fontWeight: '800' },
  statusCard: { backgroundColor: colors.ink, borderRadius: radii.lg, padding: spacing.lg, marginTop: spacing.xl },
  statusLabel: { color: '#F6C979', fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  statusValue: { color: '#FFFFFF', fontSize: 23, fontWeight: '900', marginTop: spacing.sm },
  schedule: { color: '#CDD4CF', marginTop: spacing.sm },
  metrics: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  metric: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg },
  metricValue: { color: colors.ink, fontSize: 28, fontWeight: '900' },
  metricLabel: { color: colors.muted, marginTop: spacing.xs },
  actions: { gap: spacing.md, marginTop: spacing.xl },
});
