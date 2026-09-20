import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';

const [fullName, email, phone, password] = process.argv.slice(2);

if (!fullName || !email || !phone || !password) {
  console.error('Usage: npm run create:admin -- "Full Name" email@example.com +97798XXXXXXXX "StrongPassword!1"');
  process.exit(1);
}

try {
  await connectDatabase();
  const admin = await User.create({ fullName, email, phone, password, role: 'admin', status: 'active' });
  console.log(`Admin created: ${admin.email}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}

