import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { RestaurantCard } from '../../components/RestaurantCard';
import { StatePanel } from '../../components/StatePanel';
import { colors, radii, spacing } from '../../constants/theme';
import { api, getApiErrorMessage } from '../../services/api';

const FOOD_CATEGORIES = ['Momo', 'Biryani', 'Nepali', 'Indian', 'Newari', 'Pizza', 'Burger', 'Fast Food', 'Bakery', 'Drinks'];

export default function CustomerHome() {
  const [addresses, setAddresses] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const addressResponse = await api.get('/addresses');
      const nextAddresses = addressResponse.data.data.addresses;
      setAddresses(nextAddresses);
      const selected = nextAddresses.find((address) => address.isDefault) || nextAddresses[0];
      if (!selected) {
        setRestaurants([]);
        return;
      }
      const [longitude, latitude] = selected.location.coordinates;
      const restaurantResponse = await api.get('/restaurants/nearby', { params: { latitude, longitude } });
      setRestaurants(restaurantResponse.data.data.restaurants);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const selectedAddress = addresses.find((address) => address.isDefault) || addresses[0];
  const visibleRestaurants = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return restaurants;
    return restaurants.filter((restaurant) =>
      `${restaurant.name} ${restaurant.cuisines?.join(' ')}`.toLowerCase().includes(query),
    );
  }, [restaurants, search]);

  const openRestaurant = (id) => router.push({ pathname: '/(customer)/restaurants/[id]', params: { id } });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} />}
    >
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.push('/(customer)/addresses')} style={styles.delivery}>
          <Text style={styles.eyebrow}>DELIVER TO</Text>
          <Text style={styles.addressLabel}>{selectedAddress?.label || 'Choose location'}⌄</Text>
          <Text numberOfLines={1} style={styles.addressLine}>
            {selectedAddress ? `${selectedAddress.area}, ${selectedAddress.city}` : 'Set a Nepalgunj delivery address'}
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('/(customer)/cart')} style={styles.cartButton}>
          <Text style={styles.cartText}>Cart</Text>
        </Pressable>
      </View>

      <Text style={styles.hero}>Good food, delivered around Nepalgunj.</Text>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search restaurants or cuisines"
        placeholderTextColor="#8C958E"
        style={styles.search}
      />

      <Text style={styles.sectionTitle}>Food categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {FOOD_CATEGORIES.map((category) => (
          <Pressable key={category} onPress={() => setSearch(category)} style={styles.chip}>
            <Text style={styles.chipText}>{category}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? <StatePanel loading title="Finding food near you" message="Loading approved Nepalgunj restaurants…" /> : null}
      {!loading && error ? <StatePanel title="Couldn’t load restaurants" message={error} actionLabel="Retry" onAction={() => load()} /> : null}
      {!loading && !error && !selectedAddress ? (
        <StatePanel
          title="Choose your delivery location"
          message="Allow GPS or place a map pin to see restaurants that can deliver to you."
          actionLabel="Set delivery address"
          onAction={() => router.push('/(customer)/location')}
        />
      ) : null}

      {!loading && !error && selectedAddress ? (
        <>
          <Text style={styles.sectionTitle}>Nearby restaurants</Text>
          <View style={styles.list}>
            {visibleRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} onPress={() => openRestaurant(restaurant.id)} />
            ))}
            {visibleRestaurants.length === 0 ? (
              <StatePanel title="No nearby restaurants" message="No approved, open restaurant matches this location and search yet." />
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>Popular in Nepalgunj</Text>
          <View style={styles.list}>
            {[...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 3).map((restaurant) => (
              <RestaurantCard key={`popular-${restaurant.id}`} restaurant={restaurant} onPress={() => openRestaurant(restaurant.id)} />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Recommended</Text>
          <Text style={styles.emptyCopy}>Recommendations use the nearest approved restaurants for now and improve as you order.</Text>
          <Text style={styles.sectionTitle}>Offers</Text>
          <Text style={styles.emptyCopy}>Restaurant menu discounts appear inside each restaurant.</Text>
          <Text style={styles.sectionTitle}>Previous orders</Text>
          <Text style={styles.emptyCopy}>Your completed orders will appear here after checkout is introduced.</Text>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  delivery: { flex: 1 },
  eyebrow: { color: colors.leaf, fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  addressLabel: { color: colors.ink, fontSize: 20, fontWeight: '900', marginTop: 2 },
  addressLine: { color: colors.muted, marginTop: 2 },
  cartButton: { backgroundColor: colors.ink, borderRadius: radii.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  cartText: { color: '#FFFFFF', fontWeight: '900' },
  hero: { color: colors.ink, fontSize: 30, lineHeight: 36, fontWeight: '900', marginTop: spacing.xl },
  search: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, minHeight: 52, paddingHorizontal: spacing.md, marginTop: spacing.lg, color: colors.ink },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: '900', marginTop: spacing.xl, marginBottom: spacing.md },
  chips: { gap: spacing.sm, paddingRight: spacing.lg },
  chip: { backgroundColor: '#E7EFE9', borderRadius: radii.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  chipText: { color: colors.leaf, fontWeight: '800' },
  list: { gap: spacing.md },
  emptyCopy: { color: colors.muted, lineHeight: 21, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md },
});
