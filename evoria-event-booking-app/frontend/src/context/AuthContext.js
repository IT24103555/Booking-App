import React, { createContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';
import { getErrorMessage } from '../api/apiClient';
import { getToken, removeToken, setToken } from '../storage/tokenStorage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start, load token from storage and fetch profile
  useEffect(() => {
    const init = async () => {
      try {
        const storedToken = await getToken();
        if (storedToken) {
          setTokenState(storedToken);
          // Call /users/me which uses the token
          const meRes = await userApi.getMe();
          setUser(meRes.data);
        }
      } catch (e) {
        // If token is invalid/expired, clear it
        await removeToken();
        setTokenState(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      const newToken = res.data?.token;
      const loggedUser = res.data?.user;
      if (!newToken) throw new Error('Token not found in response');

      await setToken(newToken);
      setTokenState(newToken);
      setUser(loggedUser);
      Alert.alert('Success', 'Login successful');
      return true;
    } catch (e) {
      Alert.alert('Login failed', getErrorMessage(e));
      return false;
    }
  };

  const register = async (payload) => {
    try {
      const res = await authApi.register(payload);
      const newToken = res.data?.token;
      const newUser = res.data?.user;
      if (!newToken) throw new Error('Token not found in response');

      await setToken(newToken);
      setTokenState(newToken);
      setUser(newUser);
      Alert.alert('Success', 'Registration successful');
      return true;
    } catch (e) {
      Alert.alert('Registration failed', getErrorMessage(e));
      return false;
    }
  };

  const logout = async () => {
    await removeToken();
    setTokenState(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    const meRes = await userApi.getMe();
    setUser(meRes.data);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
