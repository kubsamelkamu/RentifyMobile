import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  initiatePayment,
  checkPaymentStatus,
  InitiatePaymentResponse,
} from '../../api/payment'

export interface PaymentState {
  statuses: Record<string, "PENDING" | "SUCCESS" | "FAILED">;
  checkoutUrls: Record<string, string>;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  statuses: {},
  checkoutUrls: {},
  loading: false,
  error: null,
};

// 🔹 initiate payment
export const initiatePaymentThunk = createAsyncThunk<
  { bookingId: string; checkoutUrl: string; paymentId: string },
  { bookingId: string },
  { rejectValue: string }
>("payment/initiate", async ({ bookingId }, { rejectWithValue }) => {
  try {
    const data: InitiatePaymentResponse = await initiatePayment(bookingId);
    return { bookingId, checkoutUrl: data.checkoutUrl, paymentId: data.paymentId };
  } catch (err: any) {
    return rejectWithValue(err.message || "Payment initiation failed");
  }
});

// 🔹 check status
export const checkPaymentStatusThunk = createAsyncThunk<
  { bookingId: string; paymentStatus: "PENDING" | "SUCCESS" | "FAILED" },
  { bookingId: string; paymentId: string },
  { rejectValue: string }
>("payment/checkStatus", async ({ bookingId, paymentId }, { rejectWithValue }) => {
  try {
    const res = await checkPaymentStatus(paymentId);
    return { bookingId, paymentStatus: res.status };
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to check payment status");
  }
});

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    paymentStatusUpdated: (
      state,
      action: PayloadAction<{
        bookingId: string;
        paymentStatus: "PENDING" | "SUCCESS" | "FAILED";
      }>
    ) => {
      const { bookingId, paymentStatus } = action.payload;
      state.statuses[bookingId] = paymentStatus;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiatePaymentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiatePaymentThunk.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.statuses[payload.bookingId] = "PENDING";
        state.checkoutUrls[payload.bookingId] = payload.checkoutUrl;
      })
      .addCase(initiatePaymentThunk.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to initiate payment";
      })
      .addCase(checkPaymentStatusThunk.fulfilled, (state, { payload }) => {
        state.statuses[payload.bookingId] = payload.paymentStatus;
      });
  },
});

export const { paymentStatusUpdated } = paymentSlice.actions;
export default paymentSlice.reducer;
