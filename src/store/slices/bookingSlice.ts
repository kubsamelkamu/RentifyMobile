import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchTenantBookingsApi,
  fetchLandlordBookingsApi,
  createBookingApi,
  updateBookingApi,
  deleteBookingApi,
} from "../../api/booking";
import type {
  Booking,
  PaginatedBookingResponse,
  CreateBookingPayload,
  UpdateBookingPayload,
} from "../../api/types/booking";
import { RootState } from "../store";

interface BookingState {
  bookings: Booking[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  page: number;
  totalPages: number;
}

const initialState: BookingState = {
  bookings: [],
  status: "idle",
  error: null,
  page: 1,
  totalPages: 1,
};

// Fetch Tenant Bookings
export const fetchTenantBookings = createAsyncThunk<
  PaginatedBookingResponse,
  { page?: number; limit?: number }
>("booking/fetchTenantBookings", async ({ page = 1, limit = 10 }) => {
  return await fetchTenantBookingsApi(page, limit);
});

// Fetch Landlord Bookings
export const fetchLandlordBookings = createAsyncThunk<
  PaginatedBookingResponse,
  { page?: number; limit?: number }
>("booking/fetchLandlordBookings", async ({ page = 1, limit = 10 }) => {
  return await fetchLandlordBookingsApi(page, limit);
});

// Create Booking (needs token from auth state)
export const createBooking = createAsyncThunk<
  Booking,
  CreateBookingPayload,
  { state: RootState; rejectValue: string }
>("booking/createBooking", async (payload, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("You must be logged in to create a booking.");
    const booking = await createBookingApi(token, payload);
    return booking;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || err.message || "Booking creation failed");
  }
});

// Update Booking
export const updateBooking = createAsyncThunk<
  Booking,
  UpdateBookingPayload,
  { rejectValue: string }
>("booking/updateBooking", async (payload, { rejectWithValue }) => {
  try {
    return await updateBookingApi(payload);
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || err.message || "Booking update failed");
  }
});

// Delete Booking
export const deleteBooking = createAsyncThunk<string, string, { rejectValue: string }>(
  "booking/deleteBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      await deleteBookingApi(bookingId);
      return bookingId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message || "Booking deletion failed");
    }
  }
);

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    resetBookings(state) {
      state.bookings = [];
      state.page = 1;
      state.totalPages = 1;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Tenant Bookings
      .addCase(fetchTenantBookings.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTenantBookings.fulfilled, (state, action: PayloadAction<PaginatedBookingResponse>) => {
        state.status = "succeeded";
        if (action.payload.pagination.page === 1) {
          state.bookings = action.payload.bookings;
        } else {
          state.bookings = [...state.bookings, ...action.payload.bookings];
        }
        state.page = action.payload.pagination.page;
        state.totalPages = action.payload.pagination.totalPages;
      })
      .addCase(fetchTenantBookings.rejected, (state, action) => {
        state.status = "failed";
        state.error = "Failed to fetch tenant bookings";
      })

      // Landlord Bookings
      .addCase(fetchLandlordBookings.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchLandlordBookings.fulfilled, (state, action: PayloadAction<PaginatedBookingResponse>) => {
        state.status = "succeeded";
        if (action.payload.pagination.page === 1) {
          state.bookings = action.payload.bookings;
        } else {
          state.bookings = [...state.bookings, ...action.payload.bookings];
        }
        state.page = action.payload.pagination.page;
        state.totalPages = action.payload.pagination.totalPages;
      })
      .addCase(fetchLandlordBookings.rejected, (state, action) => {
        state.status = "failed";
        state.error =  "Failed to fetch landlord bookings";
      })

      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.status = "succeeded";
        state.bookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message || "Failed to create booking";
      })

      // Update Booking
      .addCase(updateBooking.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.status = "succeeded";
        const index = state.bookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) state.bookings[index] = action.payload;
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message || "Failed to update booking";
      })

      // Delete Booking
      .addCase(deleteBooking.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = "succeeded";
        state.bookings = state.bookings.filter((b) => b.id !== action.payload);
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message || "Failed to delete booking";
      });
  },
});

export const { resetBookings } = bookingSlice.actions;
export default bookingSlice.reducer;
