import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'evoria_token';

// Store JWT token locally on the device
export const setToken = async (token) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async () => {
  return AsyncStorage.getItem(TOKEN_KEY);
};

export const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};
