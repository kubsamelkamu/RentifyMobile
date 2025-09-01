import axios from "axios";
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig!.extra!.API_URL as string;

export interface Review {
  id: string;
  tenantId: string;
  propertyId: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  tenant: {
    id: string;
    name: string;
  };
}

export interface FetchResponse {
  reviews: Review[];
  averageRating: number;
  count: number;
  page: number;
  limit: number;
}

export const fetchPropertyReviewsApi = async (
  propertyId: string,
  page: number,
  limit: number,
  token: string
): Promise<FetchResponse> => {
  const res = await axios.get(
    `${API_BASE_URL}/api/reviews/${propertyId}?page=${page}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};


export const upsertReviewApi = async (
  propertyId: string,
  rating: number,
  title: string,
  comment: string,
  token: string
): Promise<Review> => {
  const res = await axios.post(
    `${API_BASE_URL}/api/reviews/${propertyId}`,
    { rating, title, comment },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const deleteReviewApi = async (
  propertyId: string,
  token: string
): Promise<{ success: boolean }> => {
  const res = await axios.delete(`${API_BASE_URL}/api/reviews/${propertyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
