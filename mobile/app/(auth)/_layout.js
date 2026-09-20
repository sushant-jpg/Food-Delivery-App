import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function AuthLayout() {
  const { user, isBootstrapping } = useAuth();
  if (!isBootstrapping && user) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}

