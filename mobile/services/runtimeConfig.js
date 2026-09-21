import Constants from 'expo-constants';

const extractHost = (value) => {
  if (!value) return '';
  return value.replace(/^[a-z]+:\/\//i, '').split(':')[0];
};

const expoHost = extractHost(
  Constants.expoConfig?.hostUri ||
  Constants.manifest2?.extra?.expoClient?.hostUri ||
  Constants.linkingUri,
);

export const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || (expoHost ? `http://${expoHost}:5000/api` : '');
export const socketBaseUrl = process.env.EXPO_PUBLIC_SOCKET_URL || (expoHost ? `http://${expoHost}:5000` : '');

