import { DEFAULT_PLATFORM_SETTINGS } from '../config/serviceArea.js';
import { PlatformSettings } from '../models/index.js';
import { haversineDistanceKm } from '../utils/location.js';

export const getPlatformSettings = () =>
  PlatformSettings.findOneAndUpdate(
    { key: 'default' },
    { $setOnInsert: DEFAULT_PLATFORM_SETTINGS },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );

export const isWithinActiveServiceArea = (settings, coordinates) =>
  settings.serviceAreas.some(
    (area) =>
      area.active &&
      haversineDistanceKm(coordinates, {
        latitude: area.center.latitude,
        longitude: area.center.longitude,
      }) <= area.radiusKm,
  );
