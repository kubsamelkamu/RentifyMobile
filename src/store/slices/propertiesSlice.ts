// src/store/slices/propertiesSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as propsApi from '../../api/properties';
import { Property, PaginatedProperties } from '../../api/properties';

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
>(
  'properties/fetchList',
  async (args, { rejectWithValue }) => {
    try {
      const { page, limit, city, priceRange, bedrooms, propertyType, amenities } = args;
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
      if (propertyType) {
        params.propertyType = propertyType;
      }
      if (amenities && amenities.length) {
        params.amenities = amenities.join(',');
      }

      const response = await propsApi.fetchProperties(params);
      return response.data as PaginatedProperties;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error ?? err.message ?? 'Unknown error'
      );
    }
  }
);

interface PropertiesState {
  items: Property[];
  total: number;
  page: number;
  limit: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PropertiesState = {
  items: [],
  total: 0,
  page: 1,
  limit: 9,
  status: 'idle',
  error: null,
};

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    resetProperties(state) {
      state.items = [];
      state.page = 1;
      state.total = 0;
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPropertiesThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        fetchPropertiesThunk.fulfilled,
        (state, action: PayloadAction<PaginatedProperties>) => {
          state.status = 'succeeded';
          state.items = action.payload.data;
          state.total = action.payload.total;
          state.page = action.payload.page;
          state.limit = action.payload.limit;
        }
      )
      .addCase(fetchPropertiesThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to fetch properties';
      });
  },
});

export const { resetProperties } = propertiesSlice.actions;
export default propertiesSlice.reducer;
