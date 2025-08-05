import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig!.extra!.API_URL as string;

export interface AuthResponse {
  token: string;
  role: 'admin' | 'landlord' | 'tenant';
}

export function login(email: string, password: string) {
  return axios.post<AuthResponse>(`${API_URL}/api/auth/login`, {
    email,
    password
  });
}

export function register(
  name: string,
  email: string,
  password: string
) {
  return axios.post<AuthResponse>(`${API_URL}/api/auth/register`, {
    name,
    email,
    password
  });
}

export function verifyEmail(token: string) {
  return axios.post(`${API_URL}/api/auth/verify-email`, { token });
}

export function forgotPassword(email: string) {
  return axios.post(`${API_URL}/api/auth/forgot-password`, { email });
}


export function resetPassword(
  token: string,
  password: string
) {
  return axios.post(`${API_URL}/api/auth/reset-password`, {
    token,
    password
  });
}

