import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as authApi from "../../api/auth";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export interface LandlordDoc {
  name: string;
  url: string;
}

export interface LandlordApplication {
  status: string;
  docs: LandlordDoc[];
  rejectionReason?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "TENANT" | "LANDLORD" | "ADMIN" | "SUPER_ADMIN";
  profilePhoto?: string | null;
  isVerified: boolean;
  landlordApplication?: LandlordApplication;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface AuthState {
  token: string | null;
  role: "tenant" | "landlord" | "admin" | "super_admin" | null;
  user: User | null;
  email: string | null;
  loading: boolean;
  resetToken: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  tempPassword: string | null;
}

export interface SelectedFile {
  uri: string;
  name: string;
  type: string;
}

const initialState: AuthState = {
  token: null,
  role: null,
  loading: false,
  user: null,
  status: "idle",
  error: null,
  email: null,
  resetToken: null,
  tempPassword: null,
};

function patchUser(user: any): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePhoto: user.profilePhoto ?? null,
    isVerified: user.isVerified ?? false,
    createdAt: user.createdAt,  
    updatedAt: user.updatedAt,  
    landlordApplication: user.RoleRequest
      ? {
          status: user.RoleRequest.status,
          docs: user.landlordDocs?.map((doc: any) => ({
            name: doc.docType || 'Document',  
            url: doc.url,
          })) ?? [],
          rejectionReason: user.RoleRequest.reason,  
        }
      : undefined,
  };
}

export const loginUser = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await authApi.login(email, password);
    const { token, user } = response.data;
    const patchedUser = patchUser(user);

    await SecureStore.setItemAsync("token", token);
    await SecureStore.setItemAsync("user", JSON.stringify(patchedUser));

    return { token, user: patchedUser };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || err?.message || "Login failed"
    );
  }
});

export const registerUser = createAsyncThunk<
  { user: User },
  { name: string; email: string; password: string },
  { rejectValue: string }
>("auth/registerUser", async ({ name, email, password }, { rejectWithValue, dispatch }) => {
  try {
    const response = await authApi.register(name, email, password);
    const { user, message } = response.data;

    if (!user) return rejectWithValue(message || "Registration failed");

    const patchedUser = patchUser(user);

    await SecureStore.setItemAsync("tempPassword", password);
    dispatch(setTempPassword(password));

    await SecureStore.setItemAsync("user", JSON.stringify(patchedUser));
    dispatch(setEmail(patchedUser.email));

    return { user: patchedUser };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || err?.message || "Registration failed"
    );
  }
});

export const verifyOtp = createAsyncThunk<
  AuthResponse,
  { email: string; otp: string },
  { rejectValue: string }
>("auth/verifyOtp", async ({ email, otp }, { rejectWithValue }) => {
  try {
    const response = await authApi.verifyOtp(email, otp);

    if (response.data.message === "Account verified successfully") {
      const tempPassword = await SecureStore.getItemAsync("tempPassword");
      if (!tempPassword) {
        return rejectWithValue("Temporary password not found. Please login manually.");
      }

      const loginResponse = await authApi.login(email, tempPassword);
      const { token, user } = loginResponse.data;
      await SecureStore.deleteItemAsync("tempPassword");

      const patchedUser = patchUser(user);

      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("user", JSON.stringify(patchedUser));

      return { token, user: patchedUser };
    }

    const { token, user } = response.data;
    if (!token || !user) return rejectWithValue("OTP verification failed");

    const patchedUser = patchUser(user);

    await SecureStore.setItemAsync("token", token);
    await SecureStore.setItemAsync("user", JSON.stringify(patchedUser));

    return { token, user: patchedUser };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || "OTP verification failed"
    );
  }
});

export const resendOtp = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>("auth/resendOtp", async ({ email }, { rejectWithValue }) => {
  try {
    await authApi.resendOtp(email);
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || "Failed to resend OTP"
    );
  }
});

export const forgotPassword = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>("auth/forgotPassword", async ({ email }, { rejectWithValue }) => {
  try {
    await authApi.forgotPassword(email);
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || "Forgot password failed"
    );
  }
});

export const resetPassword = createAsyncThunk<
  void,
  { token: string; newPassword: string },
  { rejectValue: string }
>("auth/resetPassword", async ({ token, newPassword }, { rejectWithValue }) => {
  try {
    await authApi.resetPassword(token, newPassword);
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error || err?.message || "Reset password failed"
    );
  }
});

export const verifyResetOtp = createAsyncThunk<
  { resetToken: string },
  { email: string; otp: string },
  { rejectValue: string }
>("auth/verifyResetOtp", async ({ email, otp }, { rejectWithValue }) => {
  try {
    const response = await authApi.verifyResetOtp(email, otp);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || "OTP verification failed"
    );
  }
});

export const applyForLandlord = createAsyncThunk<
  void,
  SelectedFile[],
  { rejectValue: string }
>("auth/applyForLandlord", async (files, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("docs", {
        uri: Platform.OS === "ios" ? file.uri.replace("file://", "") : file.uri,
        name: file.name,
        type: file.type,
      } as any);
    });
    await authApi.applyForLandlord(formData);
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || "Failed to apply for landlord"
    );
  }
});

export const fetchProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await authApi.getProfile();
    const user = patchUser(response.data);
    await SecureStore.setItemAsync("user", JSON.stringify(user));
    return user;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || "Failed to fetch profile"
    );
  }
});

export const updateProfile = createAsyncThunk<
  User,
  { name?: string; photo?: SelectedFile | null },
  { rejectValue: string }
>("auth/updateProfile", async ({ name, photo }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    if (name) formData.append("name", name);
    if (photo) {
      formData.append("profilePhoto", {
        uri: Platform.OS === "ios" ? photo.uri.replace("file://", "") : photo.uri,
        name: photo.name,
        type: photo.type,
      } as any);
    }

    const response = await authApi.updateProfile(formData);
    const user = patchUser(response.data);

    await SecureStore.setItemAsync("user", JSON.stringify(user));
    return user;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || "Failed to update profile"
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.role = null;
      state.user = null;
      state.email = null;
      state.resetToken = null;
      state.tempPassword = null;
      state.status = "idle";
      state.error = null;
      SecureStore.deleteItemAsync("token");
      SecureStore.deleteItemAsync("user");
      SecureStore.deleteItemAsync("tempPassword");
    },
    clearError(state) {
      state.error = null;
      state.status = "idle";
    },
    setAuth(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.role = action.payload.user.role.toLowerCase() as AuthState["role"];
      state.status = "succeeded";
      state.error = null;
      SecureStore.setItemAsync("token", action.payload.token);
      SecureStore.setItemAsync("user", JSON.stringify(action.payload.user));
    },
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    setTempPassword(state, action: PayloadAction<string>) {
      state.tempPassword = action.payload;
    },
    clearTempPassword(state) {
      state.tempPassword = null;
      SecureStore.deleteItemAsync("tempPassword");
    },
  },
  extraReducers: (builder) => {
    const addAsyncCases = (thunk: any) => {
      builder.addCase(thunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      });
      builder.addCase(thunk.fulfilled, (state, action: any) => {
        state.status = "succeeded";
        if (action.payload?.token && action.payload?.user) {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.role = action.payload.user.role.toLowerCase() as AuthState["role"];
          state.tempPassword = null;
        }
        if (action.payload?.resetToken) {
          state.resetToken = action.payload.resetToken;
        }
      });
      builder.addCase(thunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Action failed";
      });
    };

    [
      loginUser,
      registerUser,
      verifyOtp,
      resendOtp,
      verifyResetOtp,
      forgotPassword,
      resetPassword,
      applyForLandlord,
    ].forEach(addAsyncCases);

    builder.addCase(fetchProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(fetchProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) ?? "Failed to fetch profile";
    });

    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
});

export const {
  logout,
  clearError,
  setAuth,
  setEmail,
  setTempPassword,
  clearTempPassword,
} = authSlice.actions;

export default authSlice.reducer;