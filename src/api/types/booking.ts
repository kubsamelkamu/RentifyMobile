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
  property?: {
    id: string;
    title: string;
    image: string;
    location: string;
    price: number;
    currency: string;
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
