export const DEFAULT_PLATFORM_SETTINGS = Object.freeze({
  deliveryPricing: { baseFee: 40, perKmRate: 15, minimumFee: 40, maximumDistanceKm: 15 },
  commissionPercentage: 15,
  serviceAreas: [
    {
      name: 'Nepalgunj Central',
      city: 'Nepalgunj',
      active: true,
      center: { latitude: 28.0507, longitude: 81.6167 },
      radiusKm: 12,
    },
  ],
});

export const NEPALGUNJ_DEVELOPMENT_AREAS = Object.freeze([
  'Dhamboji',
  'BP Chowk',
  'Tribhuvan Chowk',
  'Pushpalal Chowk',
  'Karkando',
  'Surkhet Road',
  'Bageshwori area',
  'Ranjha',
  'Buspark area',
  'Nepalgunj main market',
]);

