import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { StatePanel } from '../../components/StatePanel';
import { colors, radii, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api, getApiErrorMessage } from '../../services/api';

const statuses = ['pending', 'approved', 'rejected', 'suspended'];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [reasons, setReasons] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/restaurants');
      setRestaurants(response.data.data.restaurants);
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

  const visible = useMemo(() => restaurants.filter((restaurant) => restaurant.status === filter), [filter, restaurants]);

  const transition = async (restaurant, action) => {
    setBusyId(restaurant._id);
    setError('');
    try {
      const body = ['reject', 'suspend'].includes(action) ? { reason: reasons[restaurant._id] || undefined } : undefined;
      await api.patch(`/admin/restaurants/${restaurant._id}/${action}`, body);
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Screen scroll keyboard>
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>ADMIN CONTROL</Text>
          <Text style={styles.title}>Restaurant approvals</Text>
        </View>
        <Pressable onPress={logout}><Text style={styles.logout}>Sign out</Text></Pressable>
      </View>
      <FeedbackBanner message={error} />
      <View style={styles.filters}>
        {statuses.map((status) => (
          <Pressable key={status} onPress={() => setFilter(status)} style={[styles.filter, filter === status && styles.filterActive]}>
            <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>{status}</Text>
          </Pressable>
        ))}
      </View>
      {loading ? <StatePanel loading title="Loading applications" /> : null}
      {!loading && visible.length === 0 ? <StatePanel title={`No ${filter} restaurants`} message="Applications will appear here as their status changes." /> : null}
      <View style={styles.list}>
        {visible.map((restaurant) => (
          <View key={restaurant._id} style={styles.card}>
            <Text style={styles.name}>{restaurant.name}</Text>
            <Text style={styles.meta}>{restaurant.area}, {restaurant.city} · {restaurant.cuisines.join(', ')}</Text>
            <Text style={styles.description}>{restaurant.description}</Text>
            <Text style={styles.owner}>Owner: {restaurant.owner?.fullName} · {restaurant.owner?.phone}</Text>
            {restaurant.rejectionReason ? <Text style={styles.reason}>Reason: {restaurant.rejectionReason}</Text> : null}
            {['pending', 'approved'].includes(restaurant.status) ? (
              <TextInput
                value={reasons[restaurant._id] || ''}
                onChangeText={(value) => setReasons((current) => ({ ...current, [restaurant._id]: value }))}
                placeholder={restaurant.status === 'pending' ? 'Rejection reason' : 'Suspension reason (optional)'}
                placeholderTextColor="#8C958E"
                style={styles.input}
              />
            ) : null}
            <View style={styles.actions}>
              {restaurant.status === 'pending' ? (
                <>
                  <View style={styles.action}><PrimaryButton title="Approve" loading={busyId === restaurant._id} onPress={() => transition(restaurant, 'approve')} /></View>
                  <View style={styles.action}><PrimaryButton title="Reject" variant="secondary" disabled={!reasons[restaurant._id]?.trim()} onPress={() => transition(restaurant, 'reject')} /></View>
                </>
              ) : null}
              {restaurant.status === 'approved' ? <View style={styles.action}><PrimaryButton title="Suspend" variant="secondary" onPress={() => transition(restaurant, 'suspend')} /></View> : null}
              {restaurant.status === 'suspended' ? <View style={styles.action}><PrimaryButton title="Reactivate" onPress={() => transition(restaurant, 'reactivate')} /></View> : null}
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  copy: { flex: 1 },
  eyebrow: { color: colors.leaf, fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '900', marginTop: spacing.xs },
  logout: { color: colors.primary, fontWeight: '800' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  filter: { borderRadius: radii.pill, backgroundColor: colors.surface, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  filterActive: { backgroundColor: colors.ink },
  filterText: { color: colors.ink, fontWeight: '800', textTransform: 'capitalize' },
  filterTextActive: { color: '#FFFFFF' },
  list: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg },
  name: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  meta: { color: colors.leaf, fontWeight: '800', marginTop: spacing.xs },
  description: { color: colors.muted, lineHeight: 20, marginTop: spacing.sm },
  owner: { color: colors.ink, marginTop: spacing.sm },
  reason: { color: colors.danger, marginTop: spacing.sm },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, color: colors.ink, paddingHorizontal: spacing.md, marginTop: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  action: { flex: 1 },
});
