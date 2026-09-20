import { Stack } from 'expo-router';
import { RoleGate } from '../../components/RoleGate';

export default function RestaurantLayout() {
  return <RoleGate role="restaurant"><Stack screenOptions={{ headerShown: false }} /></RoleGate>;
}

