import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig!.extra!.API_URL as string;

export interface Property {
  id: string;
  title: string;
  description?: string;
  city: string;
  rentPerMonth: number;
  numBedrooms: number;
  numBathrooms: number;
  propertyType: string;
  amenities: string[];
  status: string;
  images: { url: string }[];
  landlord: { id: string; name: string; email: string, profilePhoto?: string | null;};
}

export interface PaginatedProperties {
  data: Property[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePropertyArgs {
  title: string;
  description?: string;
  city: string;
  rentPerMonth: number;
  numBedrooms: number;
  numBathrooms: number;
  propertyType: string;
  amenities: string[];
  images?: { url: string }[];
}

/**
 * Fetch a page of approved properties with optional filters.
 * 
 * @param params Query params: city, minPrice, maxPrice, page, limit, etc.
 */
export function fetchProperties(params: Record<string, any>) {
  return axios.get<PaginatedProperties>(`${API_URL}/api/properties`, { params });
}

export async function fetchPropertyById(id: string): Promise<Property> {
  const response = await axios.get<Property>(`${API_URL}/api/properties/${id}`);
  return response.data; 
}

export async function createProperty(  token: string,data: CreatePropertyArgs) {
  return axios.post<Property>(`${API_URL}/api/properties`, data,  { headers: { Authorization: `Bearer ${token}` } });
}