import React, { useEffect, useState } from 'react';
import {View,Text,FlatList,RefreshControl,ActivityIndicator,TouchableOpacity,Image,StyleSheet,ScrollView,} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TenantStackParamList } from '../../navigation/TenantTabNavigator';
import { AppDispatch, RootState } from '../../store/store';
import { fetchPropertiesThunk } from '../../store/slices/propertiesSlice';
import type { Property } from '../../api/properties';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeroSection from '../../component/HeroSection'
import FilterPanel, { PropertyFilters } from '../../component/FilterPanel'

export default function PropertyListScreen() {

  const navigation = useNavigation<
    NativeStackNavigationProp<TenantStackParamList, 'PropertyList'>
  >();
  const dispatch = useDispatch<AppDispatch>();

  const { items, status, total, limit } = useSelector(
    (state: RootState) => state.properties
  );

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    dispatch(
      fetchPropertiesThunk({
        ...filters,
        page,
        limit,
      })
    );
  }, [dispatch, filters, page, limit]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    dispatch(
      fetchPropertiesThunk({
        ...filters,
        page: 1,
        limit,
      })
    );
    setRefreshing(false);
  };

  const hasPrev = page > 1;
  const hasNext = total > page * limit;

  const renderItem = ({ item }: { item: Property }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate('PropertyDetail', { id: item.id })}
      >
        {item.images[0]?.url && (
          <Image
            source={{ uri: item.images[0].url }}
            style={styles.cardImage}
          />
        )}
      </TouchableOpacity>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.city}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="bed-outline" size={16} />
            <Text style={styles.metaText}>{item.numBedrooms}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="water-outline" size={16} />
            <Text style={styles.metaText}>{item.numBathrooms}</Text>
          </View>
          <View style={styles.typeBadge}>
            <Text style={styles.badgeText}>{item.propertyType}</Text>
          </View>
        </View>

        <Text style={styles.cardPrice}>{item.rentPerMonth} ETB/mo</Text>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() =>
            navigation.navigate('PropertyDetail', { id: item.id })
          }
        >
          <Text style={styles.detailButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <HeroSection />
      <FilterPanel
        initial={filters}
        onCityChange={(city) => setFilters(f => ({ ...f, city }))}
        onApply={(f) => setFilters(f)}
        onReset={() => setFilters({})}
      />
      <Text style={styles.title}>Properties</Text>
      {status === 'loading' && items.length === 0 && (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      )}
      {status === 'succeeded' && items.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🏡</Text>
          <Text style={styles.emptyTitle}>No properties found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your filters.
          </Text>
        </View>
      )}
      {status === 'failed' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load properties.</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
      {(status !== 'succeeded' || items.length > 0) && (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false} 
        />
      )}
      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.pageButton, !hasPrev && styles.disabled]}
          onPress={() => hasPrev && setPage(p => p - 1)}
          disabled={!hasPrev}
        >
          <Text style={styles.pageButtonText}>Prev</Text>
        </TouchableOpacity>
        <Text style={styles.pageInfo}>Page {page}</Text>
        <TouchableOpacity
          style={[styles.pageButton, !hasNext && styles.disabled]}
          onPress={() => hasNext && setPage(p => p + 1)}
          disabled={!hasNext}
        >
          <Text style={styles.pageButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20, backgroundColor: '#FFFFFF' },

  title: {
    fontSize: 24,
    fontWeight: '600',
    marginVertical: 12,
    textAlign: 'center',
  },

  listContent: { paddingBottom: 20 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardImage: { width: '100%', height: 150 },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#555', marginBottom: 8 },
  cardPrice: { fontSize: 14, fontWeight: '500', color: '#333', marginTop: 8 },

  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  metaText: { marginLeft: 4, fontSize: 14, color: '#555' },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, color: '#0284C7' },

  detailButton: {
    marginTop: 12,
    backgroundColor: '#0284C7',
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  detailButtonText: { color: '#FFF', fontSize: 14, fontWeight: '500' },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  disabled: { opacity: 0.5 },
  pageButtonText: { fontSize: 14, fontWeight: '500' },
  pageInfo: { fontSize: 16, fontWeight: '500', marginHorizontal: 12 },

  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },

  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: { fontSize: 16, color: 'red', marginBottom: 12 },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0284C7',
    borderRadius: 5,
  },
  retryText: { color: '#FFF', fontSize: 14 },
});
