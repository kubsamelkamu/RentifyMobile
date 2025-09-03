import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {Review,FetchResponse,fetchPropertyReviewsApi,upsertReviewApi,deleteReviewApi,} from "../../api/review";

interface ReviewBucket {
  loading: boolean;
  error: string | null;
  reviews: Review[];
  averageRating: number;
  count: number;
  page: number;
  limit: number;
}

interface ReviewState {
  reviewsByProperty: Record<string, ReviewBucket>;
  upsertLoading: boolean;
  upsertError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
}

const initialState: ReviewState = {
  reviewsByProperty: {},
  upsertLoading: false,
  upsertError: null,
  deleteLoading: false,
  deleteError: null,
};

export const fetchPropertyReviews = createAsyncThunk<
  FetchResponse,
  { propertyId: string; page: number; limit: number },
  { state: RootState; rejectValue: string }
>(
  "reviews/fetchProperty",
  async ({ propertyId, page, limit }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      if (!token) throw new Error("Not authenticated");

      return await fetchPropertyReviewsApi(propertyId, page, limit, token);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch reviews");
    }
  }
);


export const upsertReview = createAsyncThunk<
  Review,
  { propertyId: string; rating: number; title: string; comment: string },
  { state: RootState; rejectValue: string }
>(
  "reviews/upsert",
  async ({ propertyId, rating, title, comment }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      if (!token) throw new Error("Not authenticated");
      return await upsertReviewApi(propertyId, rating, title, comment, token);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to save review");
    }
  }
);


export const deleteReview = createAsyncThunk<
  { success: boolean; propertyId: string },
  string,
  { state: RootState; rejectValue: string }
>("reviews/delete", async (propertyId, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const token = state.auth.token;
    if (!token) throw new Error("Not authenticated");
    const res = await deleteReviewApi(propertyId, token);
    return { ...res, propertyId };
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to delete review");
  }
});

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearReviewsForProperty: (state, action: PayloadAction<string>) => {
      delete state.reviewsByProperty[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPropertyReviews.pending, (state, action) => {
        const { propertyId, page, limit } = action.meta.arg;
        state.reviewsByProperty[propertyId] = {
          loading: true,
          error: null,
          reviews: [],
          averageRating: 0,
          count: 0,
          page,
          limit,
        };
      })
      .addCase(fetchPropertyReviews.fulfilled, (state, action) => {
        const { propertyId, page, limit } = action.meta.arg;
        const { reviews, averageRating, count } = action.payload;
        state.reviewsByProperty[propertyId] = {
          loading: false,
          error: null,
          reviews,
          averageRating,
          count,
          page,
          limit,
        };
      })
      .addCase(fetchPropertyReviews.rejected, (state, action) => {
        const { propertyId, page, limit } = action.meta.arg;
        state.reviewsByProperty[propertyId] = {
          loading: false,
          error: action.payload ?? "Failed to load reviews",
          reviews: [],
          averageRating: 0,
          count: 0,
          page,
          limit,
        };
      })

      .addCase(upsertReview.pending, (state) => {
        state.upsertLoading = true;
        state.upsertError = null;
      })
      .addCase(upsertReview.fulfilled, (state, action) => {
        state.upsertLoading = false;
        const r = action.payload;
        const pid = r.propertyId;
        const bucket = state.reviewsByProperty[pid];
        if (bucket) {
          const idx = bucket.reviews.findIndex((rev) => rev.id === r.id);
          if (idx >= 0) bucket.reviews[idx] = r;
          else bucket.reviews.unshift(r);
        }
      })
      .addCase(upsertReview.rejected, (state, action) => {
        state.upsertLoading = false;
        state.upsertError = action.payload ?? "Failed to save review";
      });
  },
});

export const { clearReviewsForProperty } = reviewSlice.actions;
export default reviewSlice.reducer;
