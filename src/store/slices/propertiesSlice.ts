import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as propsApi from "../../api/properties";
import {
  Property,
  PaginatedProperties,
  CreatePropertyArgs,
} from "../../api/properties";
import type { RootState } from "../store";

// --------------------
// Async Thunks
// --------------------
export interface FetchPropsArgs {
  page: number;
  limit: number;
  city?: string;
  priceRange?: [number, number];
  bedrooms?: [number, number];
  propertyType?: string;
  amenities?: string[];
}

export const fetchPropertiesThunk = createAsyncThunk<
  PaginatedProperties,
  FetchPropsArgs,
  { rejectValue: string }
>("properties/fetchList", async (args, { rejectWithValue }) => {
  try {
    const { page, limit, city, priceRange, bedrooms, propertyType, amenities } =
      args;
    const params: Record<string, any> = { page, limit };

    if (city) params.city = city;
    if (priceRange) {
      params.minPrice = priceRange[0];
      params.maxPrice = priceRange[1];
    }
    if (bedrooms) {
      params.minBedrooms = bedrooms[0];
      params.maxBedrooms = bedrooms[1];
    }
    if (propertyType) params.propertyType = propertyType;
    if (amenities?.length) params.amenities = amenities.join(",");

    const response = await propsApi.fetchProperties(params);
    return response.data as PaginatedProperties;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.error ?? err.message ?? "Unknown error"
    );
  }
});

// Fetch single property by ID
export const fetchPropertyById = createAsyncThunk<
  Property,
  string,
  { rejectValue: string }
>("properties/fetchById", async (id, { rejectWithValue }) => {
  try {
    return await propsApi.fetchPropertyById(id);
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.error ?? err.message ?? "Failed to fetch property"
    );
  }
});

// Create property
export const createProperty = createAsyncThunk<
  Property,
  CreatePropertyArgs,
  { state: RootState; rejectValue: string }
>("properties/create", async (data, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("Authentication required");
    const response = await propsApi.createProperty(token, data);
    return response.data as Property;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.error ?? err.message ?? "Unknown error"
    );
  }
});



// Delete property
export const deleteProperty = createAsyncThunk<
  string,
  string,
  { state: RootState; rejectValue: string }
>("properties/delete", async (id, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("Authentication required");
    await propsApi.deleteProperty(token, id);
    return id;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.error ?? err.message ?? "Failed to delete property"
    );
  }
});

// Like property
export const likeProperty = createAsyncThunk<
  { id: string; likesCount: number; likedByUser: boolean },
  string,
  { state: RootState; rejectValue: string }
>("properties/like", async (id, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("Authentication required");
    return await propsApi.likeProperty(token, id);
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.error ?? err.message ?? "Failed to like property"
    );
  }
});

// Unlike property
export const unlikeProperty = createAsyncThunk<
  { id: string; likesCount: number; likedByUser: boolean },
  string,
  { state: RootState; rejectValue: string }
>("properties/unlike", async (id, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("Authentication required");
    return await propsApi.unlikeProperty(token, id);
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.error ?? err.message ?? "Failed to unlike property"
    );
  }
});

// --------------------
// State & Helpers
// --------------------
interface PropertiesState {
  items: Property[];
  current?: Property;
  total: number;
  page: number;
  limit: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  createStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  createError: string | null;
}

const initialState: PropertiesState = {
  items: [],
  current: undefined,
  total: 0,
  page: 1,
  limit: 9,
  status: "idle",
  createStatus: "idle",
  error: null,
  createError: null,
};

// Optimistic like/unlike helper
const toggleLikeOptimistic = (
  state: PropertiesState,
  propertyId: string,
  liked: boolean
) => {
  const idx = state.items.findIndex((p) => p.id === propertyId);
  if (idx !== -1) {
    state.items[idx].likedByUser = liked;
    state.items[idx].likesCount = (state.items[idx].likesCount ?? 0) + (liked ? 1 : -1);
  }
  if (state.current?.id === propertyId) {
    state.current.likedByUser = liked;
    state.current.likesCount = (state.current.likesCount ?? 0) + (liked ? 1 : -1);
  }
};

// --------------------
// Slice
// --------------------
const propertiesSlice = createSlice({
  name: "properties",
  initialState,
  reducers: {
    resetProperties(state) {
      state.items = [];
      state.page = 1;
      state.total = 0;
      state.error = null;
      state.status = "idle";
    },
    resetCreateProperty(state) {
      state.createStatus = "idle";
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchPropertiesThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchPropertiesThunk.fulfilled,
        (state, action: PayloadAction<PaginatedProperties>) => {
          state.status = "succeeded";
          state.items = action.payload.data;
          state.total = action.payload.total;
          state.page = action.payload.page;
          state.limit = action.payload.limit;
        }
      )
      .addCase(fetchPropertiesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch properties";
      })

      // Fetch by ID
      .addCase(fetchPropertyById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch property";
      })

      // Create
      .addCase(createProperty.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createProperty.fulfilled, (state, action: PayloadAction<Property>) => {
        state.createStatus = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload ?? "Failed to create property";
      })

      .addCase(deleteProperty.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
        if (state.current?.id === action.payload) state.current = undefined;
      })

      .addCase(likeProperty.pending, (state, action) => {
        toggleLikeOptimistic(state, action.meta.arg, true);
      })
      .addCase(likeProperty.fulfilled, (state, action) => {
        const { id, likesCount, likedByUser } = action.payload;
        const idx = state.items.findIndex((p) => p.id === id);
        if (idx !== -1) {
          state.items[idx].likesCount = likesCount;
          state.items[idx].likedByUser = likedByUser;
        }
        if (state.current?.id === id) {
          state.current.likesCount = likesCount;
          state.current.likedByUser = likedByUser;
        }
      })
      .addCase(likeProperty.rejected, (state, action) => {
        toggleLikeOptimistic(state, action.meta.arg, false);
      })

      .addCase(unlikeProperty.pending, (state, action) => {
        toggleLikeOptimistic(state, action.meta.arg, false);
      })
      .addCase(unlikeProperty.fulfilled, (state, action) => {
        const { id, likesCount, likedByUser } = action.payload;
        const idx = state.items.findIndex((p) => p.id === id);
        if (idx !== -1) {
          state.items[idx].likesCount = likesCount;
          state.items[idx].likedByUser = likedByUser;
        }
        if (state.current?.id === id) {
          state.current.likesCount = likesCount;
          state.current.likedByUser = likedByUser;
        }
      })
      .addCase(unlikeProperty.rejected, (state, action) => {
        toggleLikeOptimistic(state, action.meta.arg, true);
      });
  },
});

export const { resetProperties, resetCreateProperty } = propertiesSlice.actions;
export default propertiesSlice.reducer;
