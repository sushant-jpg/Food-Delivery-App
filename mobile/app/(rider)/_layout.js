import { Stack } from 'expo-router';
import { RoleGate } from '../../components/RoleGate';

export default function RiderLayout() {
  return <RoleGate role="rider"><Stack screenOptions={{ headerShown: false }} /></RoleGate>;
}

