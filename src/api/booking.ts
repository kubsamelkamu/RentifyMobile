import axios from 'axios';
import Constants from 'expo-constants';
import { PaginatedBookingResponse, CreateBookingPayload, UpdateBookingPayload, Booking } from "../api/types/booking";

const API_URL = Constants.expoConfig!.extra!.API_URL as string; 

export const fetchTenantBookingsApi = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedBookingResponse> => {
  const res = await axios.get(`${API_URL}/bookings/tenant?page=${page}&limit=${limit}`);
  return res.data;
};

export const fetchLandlordBookingsApi = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedBookingResponse> => {
  const res = await axios.get(`${API_URL}/api/bookings/landlord?page=${page}&limit=${limit}`);
  return res.data;
};

export const createBookingApi = async (token: string, data: CreateBookingPayload) => {
  const res = await axios.post(`${API_URL}/api/bookings`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data;
};

export const updateBookingApi = async (payload: UpdateBookingPayload): Promise<Booking> => {
  const res = await axios.patch(`${API_URL}/api/bookings/${payload.bookingId}`, payload);
  return res.data;
};

export const deleteBookingApi = async (bookingId: string): Promise<void> => {
  await axios.delete(`${API_URL}/api/bookings/${bookingId}`);
};
