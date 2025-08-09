import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getProfile, updateProfile, applyForLandlord } from '../../api/profile'

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

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  landlordApplicationMessage: string | null;
}

// Async thunks
export const fetchProfile = createAsyncThunk('profile/fetchProfile', async () => {
  return await getProfile();
});

export const editProfile = createAsyncThunk(
  'profile/editProfile',
  async (data: { name?: string; email?: string; profilePhoto?: any }) => {
    return await updateProfile(data);
  }
);

export const submitLandlordApplication = createAsyncThunk(
  'profile/submitLandlordApplication',
  async (docs: { uri: string; type: string; name: string }[]) => {
    return await applyForLandlord(docs);
  }
);

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
  landlordApplicationMessage: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearMessages(state) {
      state.error = null;
      state.landlordApplicationMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<Profile>) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch profile';
      })

      .addCase(editProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editProfile.fulfilled, (state, action: PayloadAction<Profile>) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(editProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update profile';
      })

      .addCase(submitLandlordApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.landlordApplicationMessage = null;
      })
      .addCase(submitLandlordApplication.fulfilled, (state, action: PayloadAction<{ message: string }>) => {
        state.loading = false;
        state.landlordApplicationMessage = action.payload.message;
      })
      .addCase(submitLandlordApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to submit landlord application';
      });
  },
});

export const { clearMessages } = profileSlice.actions;
export default profileSlice.reducer;
