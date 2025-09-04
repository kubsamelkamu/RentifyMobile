import React, { useEffect, useCallback, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { RootState, AppDispatch } from "../../store/store";
import {
  fetchTenantBookings,
  fetchLandlordBookings,
  cancelBooking,
  confirmBooking,
  rejectBooking,
  updateBooking,
  addBooking,
} from "../../store/slices/bookingSlice";
import {
  initiatePaymentThunk,
  checkPaymentStatusThunk,
  paymentStatusUpdated,
} from "../../store/slices/paymentslice";
import type { Booking } from "../../api/types/booking";
import socket, { connectSocket, disconnectSocket } from "../../utils/socket";
import { WebView } from "react-native-webview";

export default function BookingScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { role, token } = useSelector((state: RootState) => state.auth);
  const {
    tenantBookings,
    landlordBookings,
    tenantStatus,
    landlordStatus,
    tenantError,
    landlordError,
    tenantPage,
    landlordPage,
    tenantTotalPages,
    landlordTotalPages,
  } = useSelector((state: RootState) => state.booking);
  const { statuses: paymentStatuses, loading: paymentLoading } = useSelector(
    (state: RootState) => state.payment
  );

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"cancel" | "confirm" | "reject" | "pay" | null>(
    null
  );
  const [showWebView, setShowWebView] = useState(false);
  const [currentPaymentUrl, setCurrentPaymentUrl] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const initialLoadRef = useRef(true);

  const isTenant = role?.toLowerCase() === "tenant";
  const data: Booking[] = isTenant ? tenantBookings : landlordBookings;
  const status = isTenant ? tenantStatus : landlordStatus;
  const error = isTenant ? tenantError : landlordError;
  const currentPage = isTenant ? tenantPage : landlordPage;
  const totalPages = isTenant ? tenantTotalPages : landlordTotalPages;
  const loading = status === "loading";
  const refreshing = loading && currentPage === 1;
  const loadingMore = loading && currentPage > 1;
  const hasMore = currentPage < totalPages;

  const loadInitialData = useCallback(() => {
    if (!token || !role) return;
    if (isTenant) {
      dispatch(fetchTenantBookings({ page: 1, limit: 10 }));
    } else {
      dispatch(fetchLandlordBookings({ page: 1, limit: 10 }));
    }
  }, [dispatch, isTenant, token, role]);

  // Refetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (initialLoadRef.current) {
        initialLoadRef.current = false;
        return;
      }
      loadInitialData();
    }, [loadInitialData])
  );

  // Refetch data when refetchTrigger changes
  useEffect(() => {
    loadInitialData();
  }, [refetchTrigger]);

  useEffect(() => {
    if (!token || !role) return;
    
    loadInitialData();
    connectSocket(token);

    socket.on("newBooking", (booking: Booking) => {
      // Instead of adding the booking directly, trigger a refetch to get complete data
      setRefetchTrigger(prev => prev + 1);
    });

    socket.on("bookingStatusUpdate", (updatedBooking: Booking) => {
      // Trigger refetch when booking status is updated
      setRefetchTrigger(prev => prev + 1);
    });

    socket.on(
      "paymentStatusUpdated",
      (payload: { bookingId: string; paymentStatus: "PENDING" | "SUCCESS" | "FAILED" }) => {
        dispatch(paymentStatusUpdated(payload));
        if (payload.paymentStatus === "SUCCESS") {
          Alert.alert("Success", "Payment completed successfully!");
          setRefetchTrigger(prev => prev + 1); // Trigger refetch after payment
        } else if (payload.paymentStatus === "FAILED") {
          Alert.alert("Error", "Payment failed. Please try again.");
        }
      }
    );

    return () => {
      socket.off("newBooking");
      socket.off("bookingStatusUpdate");
      socket.off("paymentStatusUpdated");
      disconnectSocket();
    };
  }, [dispatch, token, role, isTenant, loadInitialData]);

  const onRefresh = useCallback(() => {
    loadInitialData();
  }, [loadInitialData]);

  const onEndReached = useCallback(() => {
    if (!hasMore || loadingMore) return;
    if (isTenant) {
      dispatch(fetchTenantBookings({ page: tenantPage + 1, limit: 10 }));
    } else {
      dispatch(fetchLandlordBookings({ page: landlordPage + 1, limit: 10 }));
    }
  }, [dispatch, isTenant, tenantPage, landlordPage, hasMore, loadingMore]);

  const handleBookingAction = useCallback(
    async (bookingId: string, action: "cancel" | "confirm" | "reject" | "pay") => {
      if (!token) return Alert.alert("Error", "Authentication required");

      setProcessingId(bookingId);
      setActionType(action);

      try {
        switch (action) {
          case "cancel":
            await dispatch(cancelBooking(bookingId)).unwrap();
            setRefetchTrigger(prev => prev + 1); // Trigger refetch
            break;
          case "confirm":
            await dispatch(confirmBooking(bookingId)).unwrap();
            setRefetchTrigger(prev => prev + 1); // Trigger refetch
            break;
          case "reject":
            await dispatch(rejectBooking(bookingId)).unwrap();
            setRefetchTrigger(prev => prev + 1); // Trigger refetch
            break;
          case "pay":
            const result = await dispatch(initiatePaymentThunk({ bookingId })).unwrap();
            setCurrentPaymentUrl(result.checkoutUrl);
            setShowWebView(true);
            break;
        }
      } catch (err: any) {
        Alert.alert("Error", err.message || `Failed to ${action} booking`);
      } finally {
        setProcessingId(null);
        setActionType(null);
      }
    },
    [dispatch, token]
  );

  const handleWebViewClose = () => {
    setShowWebView(false);
    setCurrentPaymentUrl(null);
    if (processingId) {
      dispatch(checkPaymentStatusThunk({ bookingId: processingId, paymentId: processingId }));
    }
    // Trigger refetch after payment process
    setRefetchTrigger(prev => prev + 1);
  };

  const renderItem = ({ item }: { item: Booking }) => {
    const { property, startDate, endDate, status, id, payment } = item;
    const isProcessing = processingId === id;
    const imageUri = property?.images?.[0]?.url || property?.image || null;
    const normalizedStatus = status.toLowerCase() as
      | "pending"
      | "confirmed"
      | "cancelled"
      | "rejected";

    const paymentStatus = paymentStatuses[id] || payment?.status;
    const showPayButton =
      isTenant &&
      normalizedStatus === "confirmed" &&
      paymentStatus !== "SUCCESS" &&
      paymentStatus !== "PENDING";

    return (
      <View style={styles.card}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.title}>{property?.title || "No Title"}</Text>
          <Text style={styles.location}>{property?.city || "Unknown City"}</Text>
          <Text style={styles.rent}>
            {property?.rentPerMonth ? `ETB ${property.rentPerMonth} / month` : "No Rent Info"}
          </Text>
          <Text style={styles.dates}>
            {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
          </Text>

          {isTenant && paymentStatus && (
            <View style={styles.paymentStatusContainer}>
              <Text style={styles.paymentLabel}>Payment: </Text>
              <View
                style={[
                  styles.paymentStatusBadge,
                  paymentStatus === "SUCCESS" && styles.paymentSuccess,
                  paymentStatus === "PENDING" && styles.paymentPending,
                  paymentStatus === "FAILED" && styles.paymentFailed,
                ]}
              >
                <Text style={styles.paymentStatusText}>
                  {paymentStatus === "SUCCESS"
                    ? "Paid ✅"
                    : paymentStatus === "PENDING"
                    ?  "Paid ✅"
                    : "Failed ❌"}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                normalizedStatus === "pending" && styles.pending,
                normalizedStatus === "confirmed" && styles.confirmed,
                normalizedStatus === "cancelled" && styles.cancelled,
                normalizedStatus === "rejected" && styles.rejected,
              ]}
            >
              <Text style={styles.statusText}>
                {normalizedStatus === "pending"
                  ? "Pending"
                  : normalizedStatus === "confirmed"
                  ? "Confirmed ✅"
                  : "Cancelled ❌"}
              </Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            {isTenant && normalizedStatus === "pending" && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => handleBookingAction(id, "cancel")}
                disabled={isProcessing}
              >
                {isProcessing && actionType === "cancel" ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.buttonText}>Cancel</Text>
                )}
              </TouchableOpacity>
            )}

            {showPayButton && (
              <TouchableOpacity
                style={[styles.button, styles.payButton]}
                onPress={() => handleBookingAction(id, "pay")}
                disabled={isProcessing || paymentLoading}
              >
                {isProcessing && actionType === "pay" ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.buttonText}>Pay Now</Text>
                )}
              </TouchableOpacity>
            )}

            {!isTenant && normalizedStatus === "pending" && (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={() => handleBookingAction(id, "confirm")}
                  disabled={isProcessing}
                >
                  {isProcessing && actionType === "confirm" ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Confirm</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.rejectButton]}
                  onPress={() => handleBookingAction(id, "reject")}
                  disabled={isProcessing}
                >
                  {isProcessing && actionType === "reject" ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Reject</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading && currentPage === 1)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  if (error && data.length === 0)
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#0284C7" /> : null}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🏡</Text>
              <Text style={styles.emptyTitle}>You have no bookings yet.</Text>
            </View>
          ) : null
        }
      />

      <Modal visible={showWebView} animationType="slide" onRequestClose={handleWebViewClose}>
        <View style={styles.webViewContainer}>
          {currentPaymentUrl && (
            <WebView
              source={{ uri: currentPaymentUrl }}
              onNavigationStateChange={navState => {
                if (
                  navState.url.includes("payment-success") ||
                  navState.url.includes("payment-failed")
                ) {
                  handleWebViewClose();
                }
              }}
            />
          )}
          <TouchableOpacity style={styles.closeWebViewButton} onPress={handleWebViewClose}>
            <Text style={styles.closeWebViewText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    padding: 8,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  imagePlaceholderText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 6,
  },
  rent: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0284C7",
    marginBottom: 6,
  },
  dates: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 10,
  },
  paymentStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  paymentStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  paymentSuccess: {
    backgroundColor: "#10b981",
  },
  paymentPending: {
    backgroundColor: "#f59e0b",
  },
  paymentFailed: {
    backgroundColor: "#ef4444",
  },
  statusContainer: {
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  pending: {
    backgroundColor: "#f59e0b",
  },
  confirmed: {
    backgroundColor: "#10b981",
  },
  cancelled: {
    backgroundColor: "#ef4444",
  },
  rejected: {
    backgroundColor: "#dc2626",
  },
  loadingMore: {
    paddingVertical: 12,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 5,
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
    height: 36,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: "#ef4444",
  },
  confirmButton: {
    backgroundColor: "#10b981",
  },
  rejectButton: {
    backgroundColor: "#f59e0b",
  },
  payButton: {
    backgroundColor: "#0284C7",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  webViewContainer: {
    flex: 1,
    paddingTop: 40,
  },
  closeWebViewButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 20,
    zIndex: 1000,
  },
  closeWebViewText: {
    color: "white",
    fontWeight: "bold",
  },
});