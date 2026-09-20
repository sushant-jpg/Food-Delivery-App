import { AccountHome } from '../../components/AccountHome';

export default function RiderDashboard() {
  return (
    <AccountHome
      eyebrow="RIDER PORTAL"
      title="Rider account approved."
      description="Your rider identity is active. Availability, assignments, and delivery navigation arrive in the rider workflow phase."
      facts={[
        { label: 'Vehicle', value: (profile) => profile?.vehicleType || '—' },
        { label: 'Service city', value: (profile) => profile?.city || 'Nepalgunj' },
      ]}
    />
  );
}

