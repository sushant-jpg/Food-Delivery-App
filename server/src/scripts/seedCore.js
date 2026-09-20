import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { PlatformSettings } from '../models/PlatformSettings.js';

try {
  await connectDatabase();
  const settings = await PlatformSettings.findOneAndUpdate(
    { key: 'default' },
    {
      $setOnInsert: {
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
      },
    },
    { upsert: true, new: true, runValidators: true },
  );
  console.log(`Core settings ready with ${settings.serviceAreas.length} Nepalgunj service area(s).`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
