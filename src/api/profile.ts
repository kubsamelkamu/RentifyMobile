import axios from 'axios';
import { AxiosResponse } from 'axios';

export interface LandlordDoc {
  id: string;
  url: string;
  docType: string;
  status: string;
  reason?: string;
}

export interface RoleRequest {
  requestedRole: string;
  status: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
  RoleRequest?: RoleRequest;
  landlordDocs?: LandlordDoc[];
}

export const getProfile = async (): Promise<Profile> => {
  const res: AxiosResponse<Profile> = await axios.get('/profile/me');
  return res.data;
};

export const updateProfile = async (
  data: { name?: string; email?: string; profilePhoto?: any }
): Promise<Profile> => {
  const formData = new FormData();

  if (data.name) formData.append('name', data.name);
  if (data.email) formData.append('email', data.email);
  if (data.profilePhoto) {
    // @ts-ignore
    formData.append('profilePhoto', {
      uri: data.profilePhoto.uri,
      type: data.profilePhoto.type || 'image/jpeg',
      name: data.profilePhoto.name || 'profile.jpg',
    });
  }

  const res: AxiosResponse<Profile> = await axios.put('/profile/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
};

export const applyForLandlord = async (
  docs: { uri: string; type: string; name: string }[]
): Promise<{ message: string }> => {
  const formData = new FormData();

  docs.forEach((doc) => {
    // @ts-ignore
    formData.append('docs', {
      uri: doc.uri,
      type: doc.type || 'application/pdf',
      name: doc.name || 'document.pdf',
    });
  });

  const res: AxiosResponse<{ message: string }> = await axios.post(
    '/profile/users/apply-landlord',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  return res.data;
};
