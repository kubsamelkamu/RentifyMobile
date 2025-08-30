import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = Constants.expoConfig!.extra!.API_URL as string;
 
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'TENANT' | 'LANDLORD' | 'ADMIN' | 'SUPER_ADMIN';
  isVerified: boolean;
}
export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export function login(email: string, password: string) {
  return axios.post<AuthResponse>(`${API_URL}/api/auth/login`, { email, password });
}
export function register(name: string, email: string, password: string) {
  return axios.post<AuthResponse>(`${API_URL}/api/auth/register`, { name, email, password });
}
export function verifyEmail(token: string) {
  return axios.post(`${API_URL}/api/auth/verify-email`, { token });
}
export function forgotPassword(email: string) {
  return axios.post(`${API_URL}/api/auth/forgot-password`, { email });
}
export function resetPassword(token: string, newPassword: string) {
  return axios.post(`${API_URL}/api/auth/reset-password`, { token, newPassword });
}

export async function applyForLandlord(formData: FormData) {
  const token = await SecureStore.getItemAsync('token');
  if (!token) throw new Error('No token found, please log in again.');

  const url = `${API_URL}/api/auth/apply-landlord`;
  console.log('[AUTH] applyForLandlord ->', url);

  if (Platform.OS === 'web') {
    return axios.post(url, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: formData as any,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Upload failed (${res.status})`);
  }

  try {
    const data = await res.json();
    return { data } as any;
  } catch {
    return {} as any;
  }
}

export function verifyOtp(email: string, otp: string) {
  return axios.post<AuthResponse>(`${API_URL}/api/auth/verify-otp`, { email, otp });
}

export function resendOtp(email: string) {
  return axios.post(`${API_URL}/api/auth/resend-otp`, { email });
}

export function verifyResetOtp(email: string, otp: string) {
  return axios.post<{ resetToken: string }>(`${API_URL}/api/auth/verify-reset-otp`, { email, otp });
}
