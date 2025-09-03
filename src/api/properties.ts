import axios from "axios";
import Constants from "expo-constants";

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
  landlord: { id: string; name: string; email: string; profilePhoto?: string | null };
  likesCount?: number;
  likedByUser?: boolean;
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

export function fetchProperties(params: Record<string, any>) {
  return axios.get<PaginatedProperties>(`${API_URL}/api/properties`, { params });
}

export async function fetchPropertyById(id: string): Promise<Property> {
  const response = await axios.get<Property>(`${API_URL}/api/properties/${id}`);
  return response.data;
}

export async function createProperty(token: string, data: CreatePropertyArgs) {
  return axios.post<Property>(`${API_URL}/api/properties`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateProperty(token: string, id: string, data: Partial<CreatePropertyArgs>) {
  return axios.put<Property>(`${API_URL}/api/properties/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteProperty(token: string, id: string) {
  return axios.delete<{ success: boolean }>(`${API_URL}/api/properties/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function likeProperty(token: string, id: string) {
  const response = await axios.post<{ likes: number }>(
    `${API_URL}/api/properties/${id}/like`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return { id, likesCount: response.data.likes, likedByUser: true };
}

export async function unlikeProperty(token: string, id: string) {
  const response = await axios.delete<{ likes: number }>(
    `${API_URL}/api/properties/${id}/like`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return { id, likesCount: response.data.likes, likedByUser: false };
}
