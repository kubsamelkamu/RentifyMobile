import React, { useEffect, useState } from 'react';
import {View,Text,ActivityIndicator,Image,ScrollView,StyleSheet,} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { fetchPropertyById } from '../../api/properties';
import type { Property } from '../../api/properties';
import type { TenantStackParamList } from '../../navigation/TenantTabNavigator';
import { FontAwesome5, MaterialIcons, Entypo } from '@expo/vector-icons';

type PropertyDetailRouteProp = RouteProp<TenantStackParamList, 'PropertyDetail'>;

export default function PropertyDetailScreen() {

  const { id } = useRoute<PropertyDetailRouteProp>().params;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No Property data Found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {property.images?.[0]?.url && (
        <Image source={{ uri: property.images[0].url }} style={styles.image} />
      )}

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
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>{property.description || 'No description provided.'}</Text>
      {property.amenities?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesContainer}>
            {property.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityChip}>
                <Entypo name="check" size={14} color="white" />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Owner Info</Text>
      <View style={styles.ownerInfo}>
        <MaterialIcons name="person" size={20} color="#0284C7" />
        <Text style={styles.ownerText}>
          {property.landlord?.name || 'N/A'}
        </Text>
      </View>
      <View style={styles.ownerInfo}>
        <MaterialIcons name="email" size={20} color="#0284C7" />
        <Text style={styles.ownerText}>
          {property.landlord?.email || 'N/A'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  city: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  iconRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  iconText: {
    marginLeft: 6,
    color: '#4B5563',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
    color: '#0284C7',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 6,
    color: '#1F2937',
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ownerText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
  },
});
