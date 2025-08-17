import React, { useEffect, useCallback, useState } from 'react';
import {View, Text, StyleSheet, ActivityIndicator, FlatList, Image, TouchableOpacity, RefreshControl, Alert} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import {fetchTenantBookings,fetchLandlordBookings,cancelBooking,confirmBooking,rejectBooking} from '../../store/slices/bookingSlice';
import type { Booking } from '../../api/types/booking';

export default function BookingScreen() {

  const dispatch = useDispatch<AppDispatch>();
  const { role, token } = useSelector((state: RootState) => state.auth);
  const {tenantBookings,landlordBookings,tenantStatus,landlordStatus,tenantError,landlordError,tenantPage,landlordPage,tenantTotalPages,landlordTotalPages,
   } = useSelector((state: RootState) => state.booking);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'cancel' | 'confirm' | 'reject' | null>(null);
  const isTenant = role?.toLowerCase() === 'tenant';
  const data: Booking[] = isTenant ? tenantBookings : landlordBookings;
  const status = isTenant ? tenantStatus : landlordStatus;
  const error = isTenant ? tenantError : landlordError;
  const currentPage = isTenant ? tenantPage : landlordPage;
  const totalPages = isTenant ? tenantTotalPages : landlordTotalPages;
  const loading = status === 'loading';
  const refreshing = loading && currentPage === 1;
  const loadingMore = loading && currentPage > 1;
  const hasMore = currentPage < totalPages;

  useEffect(() => {
    if (!token || !role) return;
    loadInitialData();
  }, [dispatch, token, role, isTenant]);

  const loadInitialData = useCallback(() => {
    if (isTenant) {
      dispatch(fetchTenantBookings({ page: 1, limit: 10 }));
    } else {
      dispatch(fetchLandlordBookings({ page: 1, limit: 10 }));
    }
  }, [dispatch, isTenant]);

  const onRefresh = useCallback(() => {
    if (!token || !role) return;
    loadInitialData();
  }, [loadInitialData, token, role]);

  const onEndReached = useCallback(() => {
    if (!token || !role || !hasMore || loadingMore) return;

    if (isTenant) {
      dispatch(fetchTenantBookings({ page: tenantPage + 1, limit: 10 }));
    } else {
      dispatch(fetchLandlordBookings({ page: landlordPage + 1, limit: 10 }));
    }
  }, [dispatch, token, role, isTenant, tenantPage, landlordPage, hasMore, loadingMore]);

  const handleBookingAction = useCallback(async (bookingId: string, action: 'cancel' | 'confirm' | 'reject') => {
    if (!token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }
    setProcessingId(bookingId);
    setActionType(action);
    try {
      switch (action) {
        case 'cancel':
          await dispatch(cancelBooking(bookingId)).unwrap();
          break;
        case 'confirm':
          await dispatch(confirmBooking(bookingId)).unwrap();
          break;
        case 'reject':
          await dispatch(rejectBooking(bookingId)).unwrap();
          break;
      }
      Alert.alert('Success', `Booking ${action}ed successfully`);
    } catch (err: any) {
      Alert.alert('Error', err.message || `Failed to ${action} booking`);
    } finally {
      setProcessingId(null);
      setActionType(null);
    }
  }, [dispatch, token]);

  const renderItem = ({ item }: { item: Booking }) => {

    const { property, startDate, endDate, status, id } = item;
    const isProcessing = processingId === id;
    const imageUri =
      property?.images && property.images.length > 0
        ? property.images[0].url
        : property?.image || null;
    const normalizedStatus = status?.toLowerCase();

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
          <Text style={styles.title}>{property?.title || 'No Title'}</Text>
          <Text style={styles.location}>{property?.city || 'Unknown City'}</Text>
          <Text style={styles.rent}>
            {property?.rentPerMonth ? `ETB ${property.rentPerMonth} / month` : 'No Rent Info'}
          </Text>
          <Text style={styles.dates}>
            {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
          </Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                normalizedStatus === 'pending' && styles.pending,
                normalizedStatus === 'confirmed' && styles.confirmed,
                normalizedStatus === 'cancelled' && styles.cancelled,
              ]}
            >
              <Text style={styles.statusText}>{normalizedStatus?.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.actionsContainer}>
            {isTenant && normalizedStatus === 'pending' && (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => handleBookingAction(id, 'cancel')}
                  disabled={isProcessing}
                >
                  {isProcessing && actionType === 'cancel' ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Cancel Booking</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {!isTenant && normalizedStatus === 'pending' && (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={() => handleBookingAction(id, 'confirm')}
                  disabled={isProcessing}
                >
                  {isProcessing && actionType === 'confirm' ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Confirm</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.rejectButton]}
                  onPress={() => handleBookingAction(id, 'reject')}
                  disabled={isProcessing}
                >
                  {isProcessing && actionType === 'reject' ? (
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

  if (loading && currentPage === 1) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  if (error && data.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color="#0284C7" />
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text>No bookings found.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, padding: 8 },
  image: { width: 120, height: 120, borderRadius: 10 },
  imagePlaceholder: { width: 120, height: 120, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  imagePlaceholderText: { color: '#9ca3af', fontSize: 12 },
  cardContent: { flex: 1, padding: 12, justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  location: { fontSize: 14, color: '#6b7280', marginBottom: 6 },
  rent: { fontSize: 15, fontWeight: '600', color: '#0284C7', marginBottom: 6 },
  dates: { fontSize: 13, color: '#374151', marginBottom: 10 },
  statusContainer: { marginBottom: 10 },
  statusBadge: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  pending: { backgroundColor: '#f59e0b' },
  confirmed: { backgroundColor: '#10b981' },
  cancelled: { backgroundColor: '#ef4444' },
  loadingMore: { paddingVertical: 12 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5, gap: 8 },
  button: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, minWidth: 120, alignItems: 'center', justifyContent: 'center', height: 36 },
  buttonText: { color: 'white', fontWeight: '500', fontSize: 14 },
  cancelButton: { backgroundColor: '#ef4444' },
  confirmButton: { backgroundColor: '#10b981' },
  rejectButton: { backgroundColor: '#f59e0b' },
});
