// src/api/status.ts
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL as string;

export async function fetchStatus(): Promise<{ status: string }> {
  const response = await axios.get(`${API_URL}/health/status`);
  return response.data;
}
