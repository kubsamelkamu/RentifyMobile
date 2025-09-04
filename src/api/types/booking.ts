export type PaymentStatus = "pending" | "paid" | "failed";

export interface Booking {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;   
  totalPrice: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  tenant?: { id: string; name: string };
  landlord?: { id: string; name: string };
  property?: {
    id: string;
    title: string;
    description?: string;
    city: string;
    rentPerMonth: number;
    images: { url: string }[];
    image?: string; 
  };
    payment?: {
    status: "PENDING" | "SUCCESS" | "FAILED";
    amount?: number;
    currency?: string;
    transactionId?: string;
  };
}


export interface BookingPagination {
  page: number;
  totalPages: number;
  totalBookings: number;
}

export interface PaginatedBookingResponse {
  bookings: Booking[];
  pagination: BookingPagination;
}

export interface CreateBookingPayload {
  propertyId: string;
  startDate: string;
  endDate: string;
}

export interface UpdateBookingPayload {
  bookingId: string;
  status?: "pending" | "confirmed" | "cancelled";
  paymentStatus?: PaymentStatus;
}
