import { AccountHome } from '../../components/AccountHome';

export default function AdminDashboard() {
  return (
    <AccountHome
      eyebrow="ADMIN ACCESS"
      title="Platform administration."
      description="This account has the admin role at the API layer. Approval and analytics screens are scheduled for the admin implementation phase."
      facts={[
        { label: 'Platform', value: () => 'nepalgungdaba' },
        { label: 'Initial market', value: () => 'Nepalgunj' },
      ]}
    />
  );
}

