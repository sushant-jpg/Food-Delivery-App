import { AccountHome } from '../../components/AccountHome';

export default function CustomerHome() {
  return (
    <AccountHome
      eyebrow="WELCOME TO NEPALGUNJ"
      title="Your account is ready."
      description="Authentication is live and persisted securely on this device. Restaurant discovery and saved delivery locations are the next implementation phase."
      facts={[
        { label: 'Service city', value: () => 'Nepalgunj' },
        { label: 'Account access', value: () => 'Customer' },
      ]}
    />
  );
}

