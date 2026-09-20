import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getApiErrorMessage, setApiToken } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const TOKEN_KEY = 'nepalgungdaba.authToken';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const persistSession = useCallback(async ({ token, user: accountUser, profile: accountProfile = null }) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    setApiToken(token);
    setUser(accountUser);
    setProfile(accountProfile);
    connectSocket(token);
  }, []);

  const clearSession = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setApiToken(null);
    disconnectSocket();
    setUser(null);
    setProfile(null);
  }, []);

  const refreshAccount = useCallback(async () => {
    const response = await api.get('/auth/me');
    setUser(response.data.data.user);
    setProfile(response.data.data.profile);
    return response.data.data;
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (!token) return;
        setApiToken(token);
        const response = await api.get('/auth/me');
        setUser(response.data.data.user);
        setProfile(response.data.data.profile);
        connectSocket(token);
      } catch {
        await clearSession();
      } finally {
        setIsBootstrapping(false);
      }
    };
    restoreSession();
  }, [clearSession]);

  const submitAuth = useCallback(
    async (endpoint, values) => {
      try {
        const response = await api.post(endpoint, values);
        await persistSession(response.data.data);
        return response.data;
      } catch (error) {
        throw new Error(getApiErrorMessage(error));
      }
    },
    [persistSession],
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      isBootstrapping,
      login: (values) => submitAuth('/auth/login', values),
      registerCustomer: (values) => submitAuth('/auth/register', values),
      registerRestaurant: (values) => submitAuth('/auth/register/restaurant', values),
      registerRider: (values) => submitAuth('/auth/register/rider', values),
      forgotPassword: async (email) => {
        try {
          return (await api.post('/auth/forgot-password', { email })).data;
        } catch (error) {
          throw new Error(getApiErrorMessage(error));
        }
      },
      resetPassword: (values) => submitAuth('/auth/reset-password', values),
      refreshAccount,
      logout: clearSession,
    }),
    [clearSession, isBootstrapping, profile, refreshAccount, submitAuth, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

