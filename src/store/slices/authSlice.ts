import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as authApi from '../../api/auth';


export interface AuthResponse {
  token: string;
  role: 'admin' | 'landlord' | 'tenant';
}

export const loginUser = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(email, password);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Login failed'
      );
    }
  }
);

export const registerUser = createAsyncThunk<
  AuthResponse,
  { name: string; email: string; password: string },
  { rejectValue: string }
>(
  'auth/registerUser',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await authApi.register(name, email, password);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Registration failed'
      );
    }
  }
);

export const verifyEmail = createAsyncThunk<
  void,
  { token: string },
  { rejectValue: string }
>(
  'auth/verifyEmail',
  async ({ token }, { rejectWithValue }) => {
    try {
      await authApi.verifyEmail(token);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Email verification failed'
      );
    }
  }
);

export const forgotPassword = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      await authApi.forgotPassword(email);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Forgot password failed'
      );
    }
  }
);

export const resetPassword = createAsyncThunk<
  void,
  { token: string; password: string },
  { rejectValue: string }
>(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      await authApi.resetPassword(token, password);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Reset password failed'
      );
    }
  }
);

export interface AuthState {
  token: string | null;
  role: 'admin' | 'landlord' | 'tenant' | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  role: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.role = null;
      state.status = 'idle';
      state.error = null;
    },
    clearError(state) {
    state.error = null;
    state.status = 'idle'; 
  },
  },
  extraReducers: builder => {
    builder.addCase(loginUser.pending, state => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      state.status = 'succeeded';
      state.token = action.payload.token;
      state.role = action.payload.role;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });
    
    builder.addCase(registerUser.pending, state => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      state.status = 'succeeded';
      state.token = action.payload.token;
      state.role = action.payload.role;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // verifyEmail
    builder.addCase(verifyEmail.pending, state => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(verifyEmail.fulfilled, state => {
      state.status = 'succeeded';
    });
    builder.addCase(verifyEmail.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // forgotPassword
    builder.addCase(forgotPassword.pending, state => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(forgotPassword.fulfilled, state => {
      state.status = 'succeeded';
    });
    builder.addCase(forgotPassword.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // resetPassword
    builder.addCase(resetPassword.pending, state => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(resetPassword.fulfilled, state => {
      state.status = 'succeeded';
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
