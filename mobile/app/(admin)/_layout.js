import { Stack } from 'expo-router';
import { RoleGate } from '../../components/RoleGate';

export default function AdminLayout() {
  return <RoleGate role="admin"><Stack screenOptions={{ headerShown: false }} /></RoleGate>;
}

