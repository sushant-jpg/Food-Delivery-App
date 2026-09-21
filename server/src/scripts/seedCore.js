import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { DEFAULT_PLATFORM_SETTINGS } from '../config/serviceArea.js';
import { PlatformSettings } from '../models/PlatformSettings.js';

try {
  await connectDatabase();
  const settings = await PlatformSettings.findOneAndUpdate(
    { key: 'default' },
    {
      $setOnInsert: {
        ...DEFAULT_PLATFORM_SETTINGS,
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
