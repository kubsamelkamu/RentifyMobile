import axios from 'axios';
import Constants from 'expo-constants';
import {PaginatedBookingResponse,CreateBookingPayload,Booking} from "../api/types/booking";

const API_URL = Constants.expoConfig!.extra!.API_URL as string;

export const fetchTenantBookingsApi = async (
  token: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedBookingResponse> => {
  const res = await axios.get(`${API_URL}/api/bookings/user`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, limit },
  });

  const bookingsArray: Booking[] = Array.isArray(res.data) ? res.data : res.data.bookings;

  return {
    bookings: bookingsArray,
    pagination: {
      page,
      totalPages: 1,
      totalBookings: bookingsArray.length,
    },
  };
};

export const fetchLandlordBookingsApi = async (
  token: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedBookingResponse> => {
  const res = await axios.get(`${API_URL}/api/bookings/landlord`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, limit },
  });

  const bookingsArray: Booking[] = Array.isArray(res.data) ? res.data : res.data.bookings;

  return {
    bookings: bookingsArray,
    pagination: {
      page,
      totalPages: 1,
      totalBookings: bookingsArray.length,
    },
  };
};


export const fetchPropertyBookingsApi = async (
  token: string,
  propertyId: string
): Promise<Booking[]> => {
  const res = await axios.get(
    `${API_URL}/api/bookings/property/${propertyId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const createBookingApi = async (
  token: string, 
  data: CreateBookingPayload
): Promise<Booking> => {
  const res = await axios.post(`${API_URL}/api/bookings`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data;
};

export const confirmBookingApi = async (
  token: string,
  bookingId: string
): Promise<Booking> => {
  const res = await axios.put(
    `${API_URL}/api/bookings/${bookingId}/confirm`,
    null,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const rejectBookingApi = async (
  token: string,
  bookingId: string
): Promise<Booking> => {
  const res = await axios.put(
    `${API_URL}/api/bookings/${bookingId}/reject`,
    null,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const cancelBookingApi = async (
  token: string,
  bookingId: string
): Promise<Booking> => {
  const res = await axios.delete(
    `${API_URL}/api/bookings/${bookingId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};