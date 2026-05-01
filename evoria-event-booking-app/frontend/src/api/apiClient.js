import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';
import { getToken } from '../storage/tokenStorage';

// Axios client with:
// - Base URL
// - Automatic Authorization header
// - Clean error messages for UI

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helpful during QR/device debugging (kept quiet in production)
if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('Evoria API_BASE_URL:', API_BASE_URL);
}

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getErrorMessage = (error) => {
  if (!error) return 'Something went wrong. Please try again.';

  // Sometimes callers throw strings
  if (typeof error === 'string') return error;

  // Axios error shape: error.response?.data?.message is what our backend sends
  const responseData = error?.response?.data;
  if (responseData) {
    if (typeof responseData === 'string') return responseData;
    if (responseData.message) return responseData.message;
    if (responseData.error) return responseData.error;
  }

  // Network / timeout errors (common when using Expo QR on a physical phone)
  const msg = error?.message;
  const baseURL = error?.config?.baseURL;
  if (msg && msg.toLowerCase().includes('network')) {
    return `Cannot reach the API server. Check API_BASE_URL (${baseURL || 'not set'}) and ensure your phone and backend are on the same network.`;
  }
  if (msg && msg.toLowerCase().includes('timeout')) {
    return `Request timed out. Check API_BASE_URL (${baseURL || 'not set'}) and your network connection.`;
  }

  if (msg) return msg;
  return `Something went wrong. Please try again.`;
};
