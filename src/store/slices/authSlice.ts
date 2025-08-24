import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as authApi from '../../api/auth';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'TENANT' | 'LANDLORD' | 'ADMIN' | 'SUPER_ADMIN';
  profilePhoto?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface AuthState {
  token: string | null;
  role: 'tenant' | 'landlord' | 'admin' | 'super_admin' | null;
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface SelectedFile {
   uri: string; 
   name: string;
   type: string;
  }

const initialState: AuthState = {
  token: null, role: null, user: null, status: 'idle', error: null,
};

export const loginUser = createAsyncThunk<AuthResponse, { email: string; password: string }, { rejectValue: string }>(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(email, password);
      await SecureStore.setItemAsync('token', response.data.token);
      await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk<AuthResponse, { name: string; email: string; password: string }, { rejectValue: string }>(
  'auth/registerUser',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await authApi.register(name, email, password);
      await SecureStore.setItemAsync('token', response.data.token);
      await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err?.message || 'Registration failed');
    }
  }
);

export const verifyEmail = createAsyncThunk<void, { token: string }, { rejectValue: string }>(
  'auth/verifyEmail',
  async ({ token }, { rejectWithValue }) => {
    try { await authApi.verifyEmail(token); }
    catch (err: any) { return rejectWithValue(err?.response?.data?.message || err?.message || 'Email verification failed'); }
  }
);

export const forgotPassword = createAsyncThunk<void, { email: string }, { rejectValue: string }>(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try { await authApi.forgotPassword(email); }
    catch (err: any) { return rejectWithValue(err?.response?.data?.message || err?.message || 'Forgot password failed'); }
  }
);

export const resetPassword = createAsyncThunk<void, { token: string; password: string }, { rejectValue: string }>(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try { await authApi.resetPassword(token, password); }
    catch (err: any) { return rejectWithValue(err?.response?.data?.message || err?.message || 'Reset password failed'); }
  }
);



export const applyForLandlord = createAsyncThunk<
  void,
  SelectedFile[],
  { rejectValue: string }
>('auth/applyForLandlord', async (files, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('docs', {
        uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
        name: file.name,
        type: file.type,
      } as any);
    });

    await authApi.applyForLandlord(formData);
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Failed to apply for landlord'
    );
  }
});




const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null; state.role = null; state.user = null;
      state.status = 'idle'; state.error = null;
      SecureStore.deleteItemAsync('token');
      SecureStore.deleteItemAsync('user');
    },
    clearError(state) { state.error = null; state.status = 'idle'; },
    setAuth(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.role = action.payload.user.role.toLowerCase() as AuthState['role'];
      state.status = 'succeeded'; state.error = null;
      SecureStore.setItemAsync('token', action.payload.token);
      SecureStore.setItemAsync('user', JSON.stringify(action.payload.user));
    },
  },
  extraReducers: (builder) => {
    const addAsyncCases = (thunk: any) => {
      builder.addCase(thunk.pending, (state) => { state.status = 'loading'; state.error = null; });
      builder.addCase(thunk.fulfilled, (state, action: any) => {
        state.status = 'succeeded';
        if (action.payload?.token && action.payload?.user) {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.role = action.payload.user.role.toLowerCase() as AuthState['role'];
        }
      });
      builder.addCase(thunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Action failed';
      });
    };
    [loginUser, registerUser, verifyEmail, forgotPassword, resetPassword, applyForLandlord].forEach(addAsyncCases);
  },
});

export const { logout, clearError, setAuth } = authSlice.actions;
export default authSlice.reducer;
