import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { router } from 'expo-router';
import { FeedbackBanner } from '../../components/FeedbackBanner';
import { FormField } from '../../components/FormField';
import { PageHeader } from '../../components/PageHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { colors, radii, spacing } from '../../constants/theme';
import { api, getApiErrorMessage } from '../../services/api';

const NEPALGUNJ_CENTER = { latitude: 28.0507, longitude: 81.6167 };
const toRegion = (point) => ({ ...point, latitudeDelta: 0.015, longitudeDelta: 0.015 });
const initialForm = { label: 'Home', area: '', ward: '', addressLine: '', landmark: '', deliveryInstructions: '' };

export default function LocationScreen() {
  const mapRef = useRef(null);
  const mapReadyRef = useRef(false);
  const coordinateRef = useRef(NEPALGUNJ_CENTER);
  const requestIdRef = useRef(0);
  const locationTimeoutRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [coordinate, setCoordinate] = useState(NEPALGUNJ_CENTER);
  const [hasSelection, setHasSelection] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [mapAttempt, setMapAttempt] = useState(0);
  const [mapStatus, setMapStatus] = useState('loading');
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (field) => (value) => setForm((current) => ({ ...current, [field]: value }));

  const selectCoordinate = useCallback((next) => {
    if (!Number.isFinite(next.latitude) || !Number.isFinite(next.longitude)) return;
    // A late GPS result must never replace a pin the customer has placed.
    requestIdRef.current += 1;
    clearTimeout(locationTimeoutRef.current);
    const point = { latitude: next.latitude, longitude: next.longitude };
    coordinateRef.current = point;
    setCoordinate(point);
    setHasSelection(true);
    setStatus('selected');
    setError('');
    if (mapReadyRef.current) mapRef.current?.animateToRegion(toRegion(point), 400);
  }, []);

  const locate = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    clearTimeout(locationTimeoutRef.current);
    setStatus('loading');
    setError('');
    // Bound the whole request, including permissions and disabled GPS services.
    locationTimeoutRef.current = setTimeout(() => {
      if (requestId !== requestIdRef.current) return;
      requestIdRef.current += 1;
      setStatus('unavailable');
    }, 15000);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (requestId !== requestIdRef.current) return;
      setHasPermission(permission.status === 'granted');
      setCanAskAgain(permission.canAskAgain);
      if (permission.status !== 'granted') {
        setStatus('denied');
        return;
      }
      const enabled = await Location.hasServicesEnabledAsync();
      if (requestId !== requestIdRef.current) return;
      if (!enabled) {
        setStatus('unavailable');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (requestId !== requestIdRef.current) return;
      selectCoordinate(position.coords);
    } catch {
      if (requestId === requestIdRef.current) setStatus('unavailable');
    } finally {
      if (requestId === requestIdRef.current) clearTimeout(locationTimeoutRef.current);
    }
  }, [selectCoordinate]);

  useEffect(() => {
    const timer = setTimeout(locate, 0);
    return () => {
      clearTimeout(timer);
      clearTimeout(locationTimeoutRef.current);
      requestIdRef.current += 1;
    };
  }, [locate]);

  useEffect(() => {
    if (mapStatus !== 'loading') return undefined;
    const timer = setTimeout(() => setMapStatus('delayed'), 12000);
    return () => clearTimeout(timer);
  }, [mapAttempt, mapStatus]);

  const useManualLocation = () => {
    requestIdRef.current += 1;
    clearTimeout(locationTimeoutRef.current);
    setStatus('manual');
  };

  const retryMap = () => {
    mapReadyRef.current = false;
    setMapStatus('loading');
    setMapAttempt((current) => current + 1);
  };

  const openSettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      setError('Open your device settings and allow location access for Expo Go, then tap Retry GPS.');
    }
  };

  const save = async () => {
    if (!hasSelection) return setError('Tap the map or drag the pin to choose your delivery location first.');
    if (!form.area.trim() || !form.addressLine.trim() || !form.landmark.trim()) {
      return setError('Area, address line, and landmark are required.');
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/addresses', { ...form, ...coordinate, isDefault: true });
      router.replace('/(customer)/home');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll keyboard>
      <PageHeader title="Set delivery location" subtitle="GPS gets you close. Move the pin for the exact gate or entrance." />
      <FeedbackBanner message={error} />

      <View style={styles.mapContainer}>
        <MapView
          key={mapAttempt}
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={toRegion(coordinate)}
          onMapReady={() => {
            mapReadyRef.current = true;
            mapRef.current?.animateToRegion(toRegion(coordinateRef.current), 0);
            if (Platform.OS === 'ios') setMapStatus('ready');
          }}
          onMapLoaded={() => setMapStatus('ready')}
          onPress={(event) => selectCoordinate(event.nativeEvent.coordinate)}
          showsUserLocation={hasPermission}
          showsMyLocationButton={hasPermission}
          loadingEnabled={false}
        >
          <Marker
            coordinate={coordinate}
            title={hasSelection ? 'Delivery location' : 'Drag to your delivery location'}
            draggable
            onDragStart={useManualLocation}
            onDragEnd={(event) => selectCoordinate(event.nativeEvent.coordinate)}
          />
        </MapView>
      </View>
      {mapStatus === 'loading' ? (
        <View style={styles.mapLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.statusCopy}>Loading map...</Text>
        </View>
      ) : null}
      {mapStatus === 'delayed' ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusTitle}>Map is taking longer to load</Text>
          <Text style={styles.statusCopy}>Map tiles need an internet connection. Check Wi-Fi or mobile data and retry.</Text>
          <PrimaryButton title="Retry map" variant="secondary" onPress={retryMap} />
        </View>
      ) : null}
      <Text style={styles.hint}>Tap the map or drag the pin to the exact gate or entrance. GPS is optional.</Text>

      {status === 'loading' ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusTitle}>Loading location</Text>
          <Text style={styles.statusCopy}>Finding your GPS position. You can select a delivery pin on the map now.</Text>
          <PrimaryButton title="Select manually" variant="secondary" onPress={useManualLocation} />
        </View>
      ) : null}
      {status === 'denied' ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusTitle}>Permission denied</Text>
          <Text style={styles.statusCopy}>You can still tap the Nepalgunj map to place your delivery pin, or allow location access in settings.</Text>
          <View style={styles.statusActions}>
            <PrimaryButton title={canAskAgain ? 'Retry GPS' : 'Open location settings'} onPress={canAskAgain ? locate : openSettings} />
            {!canAskAgain ? <PrimaryButton title="Retry GPS after enabling location" variant="secondary" onPress={locate} /> : null}
            <PrimaryButton title="Select manually" variant="secondary" onPress={useManualLocation} />
          </View>
        </View>
      ) : null}
      {status === 'unavailable' ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusTitle}>Location unavailable</Text>
          <Text style={styles.statusCopy}>Check that location services are on, retry, or select your position manually.</Text>
          <View style={styles.statusActions}>
            <PrimaryButton title="Retry GPS" onPress={locate} />
            <PrimaryButton title="Select manually" variant="secondary" onPress={useManualLocation} />
          </View>
        </View>
      ) : null}

      {status === 'manual' || status === 'selected' ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusTitle}>{hasSelection ? 'Location selected' : 'Choose your delivery pin'}</Text>
          <Text style={styles.statusCopy}>{hasSelection ? 'Check the pin, then save your address below.' : 'The map starts in central Nepalgunj. Tap your entrance or drag the pin before saving.'}</Text>
          <PrimaryButton title="Use my current location" variant="secondary" onPress={locate} />
        </View>
      ) : null}

      {hasSelection ? (
        <>
          <Text style={styles.selected}>Location selected · {coordinate.latitude.toFixed(5)}, {coordinate.longitude.toFixed(5)}</Text>

          <Text style={styles.sectionTitle}>Save address</Text>
          <Text style={styles.label}>Label</Text>
          <View style={styles.labels}>
            {['Home', 'Work', 'Other'].map((label) => (
              <Pressable key={label} onPress={() => update('label')(label)} style={[styles.labelChoice, form.label === label && styles.labelActive]}>
                <Text style={[styles.labelText, form.label === label && styles.labelTextActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>
          <FormField label="Area" value={form.area} onChangeText={update('area')} placeholder="Dhamboji" autoCapitalize="words" />
          <FormField label="Ward (optional)" value={form.ward} onChangeText={update('ward')} keyboardType="number-pad" />
          <FormField label="Address line" value={form.addressLine} onChangeText={update('addressLine')} placeholder="Street, tole, or building" autoCapitalize="words" />
          <FormField label="Landmark" value={form.landmark} onChangeText={update('landmark')} placeholder="Near Dhamboji Chowk" autoCapitalize="sentences" />
          <FormField
            label="Delivery instructions"
            value={form.deliveryInstructions}
            onChangeText={update('deliveryInstructions')}
            placeholder="Blue gate beside the pharmacy."
            autoCapitalize="sentences"
            multiline
          />
          <PrimaryButton title="Confirm and save address" onPress={save} loading={saving} />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusBox: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm, marginTop: spacing.md },
  statusTitle: { color: colors.ink, fontSize: 19, fontWeight: '900' },
  statusCopy: { color: colors.muted, lineHeight: 21 },
  statusActions: { gap: spacing.sm, marginTop: spacing.sm },
  mapContainer: { width: '100%', height: 310, flexShrink: 0, borderRadius: radii.lg, overflow: 'hidden', backgroundColor: '#E7EFE9' },
  mapLoading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  selected: { color: colors.success, fontWeight: '900', marginTop: spacing.md },
  hint: { color: colors.muted, marginTop: spacing.xs },
  sectionTitle: { color: colors.ink, fontSize: 22, fontWeight: '900', marginTop: spacing.xl, marginBottom: spacing.md },
  label: { color: colors.ink, fontSize: 14, fontWeight: '700', marginBottom: spacing.sm },
  labels: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  labelChoice: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, alignItems: 'center', backgroundColor: colors.surface },
  labelActive: { backgroundColor: colors.leaf, borderColor: colors.leaf },
  labelText: { color: colors.ink, fontWeight: '800' },
  labelTextActive: { color: '#FFFFFF' },
});
