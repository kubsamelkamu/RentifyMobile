import React, { useEffect, useState, useMemo } from 'react';
import {View, Text, ActivityIndicator, Image, ScrollView,StyleSheet, TouchableOpacity, Alert, SafeAreaView,} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchPropertyById } from '../../api/properties';
import type { Property } from '../../api/properties';
import { createBooking } from '../../store/slices/bookingSlice';
import { FontAwesome5, MaterialIcons, Entypo } from '@expo/vector-icons';
import type { TenantStackParamList } from '../../navigation/TenantTabNavigator';
import PropertiesReview from './propertiesReview';

type PropertyDetailRouteProp = RouteProp<TenantStackParamList, 'PropertyDetail'>;

export default function PropertyDetailScreen() {

  const { id } = useRoute<PropertyDetailRouteProp>().params;
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { token, role } = useSelector((state: RootState) => state.auth);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await fetchPropertyById(id);
        setProperty(response);
        setError(null);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err?.response?.data?.error || 'Failed to fetch property');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const nights = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const ms = endDate.getTime() - startDate.getTime();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  const toISODateOnly = (d: Date) =>
    new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();

  const handleRequestBooking = async () => {
    if (!token || role?.toLowerCase() !== 'tenant') {
      Alert.alert(
        'Not allowed',
        !token
          ? 'Please login as a tenant to request a booking.'
          : 'Only tenants can request bookings.',
        [
          { text: 'Cancel' },
          !token ? { text: 'Login', onPress: () => navigation.navigate('Login') } : {},
        ]
      );
      return;
    }

    if (!startDate || !endDate) {
      Alert.alert('Missing Dates', 'Please select both start and end dates.');
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('Invalid Dates', 'End date must be after start date.');
      return;
    }

    try {
      setSubmitting(true);
      await dispatch(
        createBooking({
          propertyId: id,
          startDate: toISODateOnly(startDate),
          endDate: toISODateOnly(endDate),
        })
      ).unwrap();

      Alert.alert(
        'Request sent ✅',
        `Your booking request from ${startDate.toDateString()} to ${endDate.toDateString()} has been sent.`
      );
      setStartDate(null);
      setEndDate(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || err?.message || 'Could not request booking. Please try again.';
      Alert.alert('Booking failed', msg);
      console.log("Booking Error:", JSON.stringify(err, null, 2));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChat = () => {
    if (property?.id && property.landlord?.id) {
      navigation.navigate('PropertyChat', {
        propertyId: property.id,
        landlordId: property.landlord.id,
      });
    } else {
      Alert.alert('Chat unavailable', 'Landlord info not found.');
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  if (error) return <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>;
  if (!property) return <View style={styles.centered}><Text style={styles.errorText}>No property found.</Text></View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {property.images?.[0]?.url && <Image source={{ uri: property.images[0].url }} style={styles.image} />}
        <View style={styles.headerRow}>
          <Text style={styles.title}>{property.title}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{property.propertyType}</Text>
          </View>
        </View>
        <Text style={styles.city}>{property.city}</Text>

        <View style={styles.iconRow}>
          <View style={styles.iconItem}>
            <FontAwesome5 name="bed" size={18} color="#4B5563" />
            <Text style={styles.iconText}>{property.numBedrooms} Bedrooms</Text>
          </View>
          <View style={styles.iconItem}>
            <FontAwesome5 name="bath" size={18} color="#4B5563" />
            <Text style={styles.iconText}>{property.numBathrooms} Bathrooms</Text>
          </View>
        </View>

        <Text style={styles.price}>Rent: {property.rentPerMonth} ETB/month</Text>

        <View style={styles.bookingSection}>
          <Text style={styles.sectionTitle}>Select Dates</Text>
          <Text style={styles.summaryText}>{nights > 0 ? `${nights} night${nights > 1 ? 's' : ''}` : 'Pick dates'}</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)} disabled={submitting}>
            <Text style={styles.dateButtonText}>{startDate ? `Start: ${startDate.toDateString()}` : 'Select Start Date'}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(e, d) => {
                setShowStartPicker(false);
                if (d) {
                  setStartDate(d);
                  if (endDate && d > endDate) setEndDate(null);
                }
              }}
            />
          )}

          <TouchableOpacity style={[styles.dateButton, !startDate && styles.disabledBtn]} onPress={() => setShowEndPicker(true)} disabled={!startDate || submitting}>
            <Text style={[styles.dateButtonText, !startDate && { color: '#999' }]}>{endDate ? `End: ${endDate.toDateString()}` : startDate ? 'Select End Date' : 'Select Start Date First'}</Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate || startDate || new Date()}
              mode="date"
              display="default"
              minimumDate={startDate || new Date()}
              onChange={(e, d) => {
                setShowEndPicker(false);
                if (d) setEndDate(d);
              }}
            />
          )}

          <TouchableOpacity style={[styles.bookingButton, (submitting || !startDate || !endDate) && styles.bookingButtonDisabled]} onPress={handleRequestBooking} disabled={submitting || !startDate || !endDate}>
            <Text style={styles.bookingButtonText}>{submitting ? 'Sending…' : 'Request Booking'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{property.description || 'No description provided.'}</Text>
        {property.amenities?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {property.amenities.map((a, i) => (
                <View key={i} style={styles.amenityChip}>
                  <Entypo name="check" size={14} color="white" />
                  <Text style={styles.amenityText}>{a}</Text>
                </View>
              ))}
            </View>
          </>
        )}
        <Text style={styles.sectionTitle}>Owner Info</Text>
        <View style={styles.ownerInfo}>
          <MaterialIcons name="person" size={20} color="#0284C7" />
          <Text style={styles.ownerText}>{property.landlord?.name || 'N/A'}</Text>
        </View>
        <View style={styles.ownerInfo}>
          <MaterialIcons name="email" size={20} color="#0284C7" />
          <Text style={styles.ownerText}>{property.landlord?.email || 'N/A'}</Text>
        </View>

        {property?.landlord?.id && token && role && (
          <TouchableOpacity style={styles.chatButton} onPress={handleOpenChat}>
            <Text style={styles.chatButtonText}>{role.toLowerCase() === 'tenant' ? 'Chat with Landlord' : 'View Property Chat'}</Text>
          </TouchableOpacity>
        )}

        {/* === Reviews Section === */}
        <PropertiesReview route={{ params: { propertyId: property.id } }} />
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, paddingBottom: 30 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  errorText: { fontSize: 16, color: 'red' },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', flex: 1, marginRight: 8 },
  typeBadge: { backgroundColor: '#0284C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  typeText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  city: { fontSize: 18, color: '#666', marginBottom: 16 },
  iconRow: { flexDirection: 'row', marginBottom: 12 },
  iconItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  iconText: { marginLeft: 6, color: '#4B5563' },
  price: { fontSize: 18, fontWeight: '600', marginVertical: 12, color: '#0284C7' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 6, color: '#1F2937' },
  description: { fontSize: 16, lineHeight: 22, color: '#333' },
  amenitiesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  amenityChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  amenityText: { color: '#fff', fontSize: 14, marginLeft: 5 },
  ownerInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  ownerText: { marginLeft: 8, fontSize: 16, color: '#374151' },
  bookingSection: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16, marginVertical: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  summaryText: { fontSize: 14, color: '#555', marginBottom: 12 },
  dateButton: { backgroundColor: '#f0f0f0', padding: 14, borderRadius: 8, marginBottom: 10 },
  disabledBtn: { opacity: 0.6 },
  dateButtonText: { fontSize: 16, color: '#333', textAlign: 'center' },
  bookingButton: { backgroundColor: '#0284C7', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  bookingButtonDisabled: { opacity: 0.7 },
  bookingButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  chatButton: { backgroundColor: '#10B981', padding: 15, borderRadius: 12, alignItems: 'center', marginVertical: 16 },
  chatButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
