import { Stack } from 'expo-router';
import { RoleGate } from '../../components/RoleGate';

export default function CustomerLayout() {
  return <RoleGate role="customer"><Stack screenOptions={{ headerShown: false }} /></RoleGate>;
}

