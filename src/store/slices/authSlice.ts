import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as authApi from '../../api/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'TENANT' | 'LANDLORD' | 'ADMIN' | 'SUPER_ADMIN';
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

const initialState: AuthState = {
  token: null,
  role: null,
  user: null,
  status: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>('auth/loginUser', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await authApi.login(email, password);
    console.log(response.data)
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk<
  AuthResponse,
  { name: string; email: string; password: string },
  { rejectValue: string }
>('auth/registerUser', async ({ name, email, password }, { rejectWithValue }) => {
  try {
    const response = await authApi.register(name, email, password);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Registration failed');
  }
});

export const verifyEmail = createAsyncThunk<void, { token: string }, { rejectValue: string }>(
  'auth/verifyEmail',
  async ({ token }, { rejectWithValue }) => {
    try {
      await authApi.verifyEmail(token);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Email verification failed');
    }
  }
);

export const forgotPassword = createAsyncThunk<void, { email: string }, { rejectValue: string }>(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      await authApi.forgotPassword(email);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Forgot password failed');
    }
  }
);

export const resetPassword = createAsyncThunk<
  void,
  { token: string; password: string },
  { rejectValue: string }
>('auth/resetPassword', async ({ token, password }, { rejectWithValue }) => {
  try {
    await authApi.resetPassword(token, password);
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Reset password failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.role = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    clearError(state) {
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    // ---------- LOGIN ----------
    builder.addCase(loginUser.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      state.status = 'succeeded';
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.role = action.payload.user.role.toLowerCase() as AuthState['role'];
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload ?? 'Login failed';
    });
    builder.addCase(registerUser.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      state.status = 'succeeded';
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.role = action.payload.user.role.toLowerCase() as AuthState['role'];
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload ?? 'Registration failed';
    });
    builder.addCase(verifyEmail.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(verifyEmail.fulfilled, (state) => {
      state.status = 'succeeded';
    });
    builder.addCase(verifyEmail.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload ?? 'Email verification failed';
    });
    builder.addCase(forgotPassword.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(forgotPassword.fulfilled, (state) => {
      state.status = 'succeeded';
    });
    builder.addCase(forgotPassword.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload ?? 'Forgot password failed';
    });
    builder.addCase(resetPassword.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(resetPassword.fulfilled, (state) => {
      state.status = 'succeeded';
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload ?? 'Reset password failed';
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
