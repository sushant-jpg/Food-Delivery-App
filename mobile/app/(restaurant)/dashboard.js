import { AccountHome } from '../../components/AccountHome';

export default function RestaurantDashboard() {
  return (
    <AccountHome
      eyebrow="RESTAURANT PORTAL"
      title="Partner account approved."
      description="Your authorization is enforced by both the app and API. Menu and order operations arrive in the next product phases."
      facts={[
        { label: 'Restaurant', value: (profile) => profile?.name || '—' },
        { label: 'Area', value: (profile) => profile?.area || 'Nepalgunj' },
      ]}
    />
  );
}

