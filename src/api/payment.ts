import axios from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const API_URL = Constants.expoConfig!.extra!.API_URL as string;

export interface InitiatePaymentResponse {
  checkoutUrl: string;
  paymentId: string;
}

export async function initiatePayment(bookingId: string) {
  const token = await SecureStore.getItemAsync("token");
  if (!token) throw new Error("No token found, please log in again.");

  const res = await axios.post<InitiatePaymentResponse>(
    `${API_URL}/api/payments/initiate`,
    { bookingId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data; // { checkoutUrl, paymentId }
}


export async function checkPaymentStatus(paymentId: string) {
  const token = await SecureStore.getItemAsync("token");
  if (!token) throw new Error("No token found, please log in again.");

  const res = await axios.get<{ status: "PENDING" | "SUCCESS" | "FAILED" }>(
    `${API_URL}/api/payments/${paymentId}/status`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}
