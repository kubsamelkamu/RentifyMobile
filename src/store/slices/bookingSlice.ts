import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  createBookingApi,
  fetchTenantBookingsApi,
  fetchLandlordBookingsApi,
  confirmBookingApi,
  rejectBookingApi,
  cancelBookingApi,
  fetchPropertyBookingsApi,
} from "../../api/booking";
import type { Booking, CreateBookingPayload, PaginatedBookingResponse } from "../../api/types/booking";
import type { RootState } from "../store";

interface BookingState {
  tenantBookings: Booking[];
  landlordBookings: Booking[];
  propertyBookings: Booking[];

  tenantStatus: "idle" | "loading" | "succeeded" | "failed";
  landlordStatus: "idle" | "loading" | "succeeded" | "failed";
  tenantError: string | null;
  landlordError: string | null;

  tenantPage: number;
  landlordPage: number;
  tenantTotalPages: number;
  landlordTotalPages: number;

  currentBookingType: "tenant" | "landlord" | "property" | null;
}

const initialState: BookingState = {
  tenantBookings: [],
  landlordBookings: [],
  propertyBookings: [],

  tenantStatus: "idle",
  landlordStatus: "idle",
  tenantError: null,
  landlordError: null,

  tenantPage: 1,
  landlordPage: 1,
  tenantTotalPages: 1,
  landlordTotalPages: 1,

  currentBookingType: null,
};

// ------------------- Async Thunks -------------------

export const createBooking = createAsyncThunk<
  Booking,
  CreateBookingPayload,
  { state: RootState; rejectValue: string }
>("booking/createBooking", async (payload, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("Authentication required");
    const booking = await createBookingApi(token, payload);
    return booking;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || err.message || "Booking creation failed");
  }
});

export const fetchTenantBookings = createAsyncThunk<
  PaginatedBookingResponse,
  { page: number; limit: number },
  { state: RootState; rejectValue: string }
>("booking/fetchTenantBookings", async ({ page, limit }, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("Authentication required");

    const response = await fetchTenantBookingsApi(token, page, limit);
    return response;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || err.message || "Failed to fetch tenant bookings");
  }
});

export const fetchLandlordBookings = createAsyncThunk<
  PaginatedBookingResponse,
  { page: number; limit: number },
  { state: RootState; rejectValue: string }
>("booking/fetchLandlordBookings", async ({ page, limit }, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("Authentication required");

    const response = await fetchLandlordBookingsApi(token, page, limit);
    return response;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || err.message || "Failed to fetch landlord bookings");
  }
});

export const fetchPropertyBookings = createAsyncThunk<
  Booking[],
  string,
  { state: RootState; rejectValue: string }
>("booking/fetchPropertyBookings", async (propertyId, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("Authentication required");

    const bookings = await fetchPropertyBookingsApi(token, propertyId);
    return bookings;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || err.message || "Failed to fetch property bookings");
  }
});

export const confirmBooking = createAsyncThunk<Booking, string, { state: RootState; rejectValue: string }>(
  "booking/confirmBooking",
  async (bookingId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue("Authentication required");

      const booking = await confirmBookingApi(token, bookingId);
      return booking;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message || "Failed to confirm booking");
    }
  }
);

export const rejectBooking = createAsyncThunk<Booking, string, { state: RootState; rejectValue: string }>(
  "booking/rejectBooking",
  async (bookingId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue("Authentication required");

      const booking = await rejectBookingApi(token, bookingId);
      return booking;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message || "Failed to reject booking");
    }
  }
);

export const cancelBooking = createAsyncThunk<Booking, string, { state: RootState; rejectValue: string }>(
  "booking/cancelBooking",
  async (bookingId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue("Authentication required");
      const booking = await cancelBookingApi(token, bookingId);
      return booking;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message || "Failed to cancel booking");
    }
  }
);

// ------------------- Slice -------------------

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    resetBookings(state) {
      state.tenantBookings = [];
      state.landlordBookings = [];
      state.propertyBookings = [];
      state.tenantPage = 1;
      state.landlordPage = 1;
      state.tenantTotalPages = 1;
      state.landlordTotalPages = 1;
      state.tenantStatus = "idle";
      state.landlordStatus = "idle";
      state.tenantError = null;
      state.landlordError = null;
      state.currentBookingType = null;
    },
    setCurrentBookingType(state, action: PayloadAction<BookingState["currentBookingType"]>) {
      state.currentBookingType = action.payload;
    },
    addBooking(state, action: PayloadAction<{ booking: Booking; role: "tenant" | "landlord" | null }>) {
      const { booking, role } = action.payload;
      if (role === "tenant") state.tenantBookings = [booking, ...state.tenantBookings];
      else if (role === "landlord") state.landlordBookings = [booking, ...state.landlordBookings];
    },
    updateBooking(state, action: PayloadAction<Booking>) {
      const updatedBooking = action.payload;
      const updateArray = (arr: Booking[]) => {
        const index = arr.findIndex((b) => b.id === updatedBooking.id);
        if (index !== -1) {
          arr[index] = { ...arr[index], ...updatedBooking };
        }
      };
      updateArray(state.tenantBookings);
      updateArray(state.landlordBookings);
      updateArray(state.propertyBookings);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTenantBookings.pending, (state) => {
        state.tenantStatus = "loading";
        state.tenantError = null;
        state.currentBookingType = "tenant";
      })
      .addCase(fetchTenantBookings.fulfilled, (state, action: PayloadAction<PaginatedBookingResponse>) => {
        state.tenantStatus = "succeeded";
        if (action.payload.pagination.page === 1) state.tenantBookings = action.payload.bookings;
        else state.tenantBookings = [...state.tenantBookings, ...action.payload.bookings];
        state.tenantPage = action.payload.pagination.page;
        state.tenantTotalPages = action.payload.pagination.totalPages;
      })
      .addCase(fetchTenantBookings.rejected, (state, action) => {
        state.tenantStatus = "failed";
        state.tenantError = (action.payload as string) || action.error.message || "Failed to fetch tenant bookings";
      })
      .addCase(fetchLandlordBookings.pending, (state) => {
        state.landlordStatus = "loading";
        state.landlordError = null;
        state.currentBookingType = "landlord";
      })
      .addCase(fetchLandlordBookings.fulfilled, (state, action: PayloadAction<PaginatedBookingResponse>) => {
        state.landlordStatus = "succeeded";
        if (action.payload.pagination.page === 1) state.landlordBookings = action.payload.bookings;
        else state.landlordBookings = [...state.landlordBookings, ...action.payload.bookings];
        state.landlordPage = action.payload.pagination.page;
        state.landlordTotalPages = action.payload.pagination.totalPages;
      })
      .addCase(fetchLandlordBookings.rejected, (state, action) => {
        state.landlordStatus = "failed";
        state.landlordError = (action.payload as string) || action.error.message || "Failed to fetch landlord bookings";
      })
      .addCase(fetchPropertyBookings.pending, (state) => {
        state.currentBookingType = "property";
        state.tenantStatus = "loading";
        state.tenantError = null;
      })
      .addCase(fetchPropertyBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.propertyBookings = action.payload;
        state.tenantStatus = "succeeded";
      })
      .addCase(fetchPropertyBookings.rejected, (state, action) => {
        state.tenantStatus = "failed";
        state.tenantError = (action.payload as string) || action.error.message || "Failed to fetch property bookings";
      })
      .addCase(confirmBooking.fulfilled, (state, action: PayloadAction<Booking>) => updateBookingInState(state, action.payload))
      .addCase(rejectBooking.fulfilled, (state, action: PayloadAction<Booking>) => updateBookingInState(state, action.payload))
      .addCase(cancelBooking.fulfilled, (state, action: PayloadAction<Booking>) => updateBookingInState(state, action.payload));
  },
});

function updateBookingInState(state: BookingState, updatedBooking: Booking) {
  const updateArray = (arr: Booking[]) => {
    const index = arr.findIndex((b) => b.id === updatedBooking.id);
    if (index !== -1) {
      arr[index] = { ...arr[index], ...updatedBooking, property: arr[index].property || updatedBooking.property };
    }
  };
  updateArray(state.tenantBookings);
  updateArray(state.landlordBookings);
  updateArray(state.propertyBookings);
}

export const { resetBookings, setCurrentBookingType, addBooking, updateBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
