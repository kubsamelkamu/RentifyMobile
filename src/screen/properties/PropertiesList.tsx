import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View,Text,FlatList,RefreshControl,ActivityIndicator,TouchableOpacity,Image,StyleSheet,} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStackNavigator';
import { fetchPropertiesThunk } from '../../store/slices/propertiesSlice';
import { logout } from '../../store/slices/authSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { Property } from '../../api/properties';
import HeroSection from '../../component/HeroSection';
import FilterPanel, { PropertyFilters } from '../../component/FilterPanel';

type Props = { isInTab?: boolean };

const SkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonImage} />
    <View style={styles.skeletonLine} />
    <View style={styles.skeletonLineShort} />
  </View>
);

type StackNavProp = NativeStackNavigationProp<RootStackParamList, 'PropertyDetail'>;

export default function PropertyListScreen({ isInTab = false }: Props) {
  
  const dispatch = useDispatch<AppDispatch>();
  const { items, status, total, limit } = useSelector((state: RootState) => state.properties)!;
  const { token } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation<StackNavProp>();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 12 }}
            onPress={() => {
              if (token) dispatch(logout());
              else navigation.navigate('Login');
            }}
          >
            <Text style={{ color: '#0284C7', fontWeight: '600' }}>{token ? 'Logout' : 'Login'}</Text>
          </TouchableOpacity>
        ),
      });
    }, [navigation, token, dispatch])
  );

  useEffect(() => {
    const load = async () => {
      await dispatch(fetchPropertiesThunk({ ...filters, page, limit }));
      setInitialLoading(false);
    };
    load();
  }, [dispatch, filters, page, limit]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    dispatch(fetchPropertiesThunk({ ...filters, page: 1, limit })).finally(() => setRefreshing(false));
  }, [dispatch, filters, limit]);

  const onEndReached = useCallback(() => {
    const lastPage = Math.ceil(total / limit);
    if (page < lastPage && status !== 'loading') {
      setPage((prev) => prev + 1);
    }
  }, [page, total, limit, status]);

  const goToDetail = useCallback(
    (id: string) => {
      navigation.navigate('PropertyDetail', { id }); 
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Property }) => (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => goToDetail(item.id)}>
          {item.images[0]?.url && (
            <Image source={{ uri: item.images[0].url }} style={styles.cardImage} resizeMode="cover" />
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
          <TouchableOpacity style={styles.detailButton} onPress={() => goToDetail(item.id)}>
            <Text style={styles.detailButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [goToDetail]
  );

  const ListHeader = useMemo(
    () => (
      <>
        <HeroSection />
        <FilterPanel
          initial={filters}
          onCityChange={(city) => setFilters((f) => ({ ...f, city }))}
          onApply={(f) => setFilters(f)}
          onReset={() => setFilters({})}
        />
      </>
    ),
    [filters]
  );

  if (initialLoading) {
    return (
      <FlatList
        data={Array.from({ length: 5 })}
        keyExtractor={(_, index) => index.toString()}
        renderItem={() => <SkeletonCard />}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.container}
      />
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={status === 'loading' && page > 1 ? <ActivityIndicator style={{ margin: 16 }} /> : null}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        status === 'succeeded' && items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🏡</Text>
            <Text style={styles.emptyTitle}>No properties found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your filters.</Text>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20, backgroundColor: '#FFFFFF' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 16,
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
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  metaText: { marginLeft: 4, fontSize: 14, color: '#555' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#E0F2FE', borderRadius: 12 },
  badgeText: { fontSize: 12, color: '#0284C7' },
  detailButton: { marginTop: 12, backgroundColor: '#0284C7', paddingVertical: 8, borderRadius: 5, alignItems: 'center' },
  detailButtonText: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  emptyContainer: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
  skeletonCard: { padding: 15, marginHorizontal: 16, marginBottom: 16, backgroundColor: '#eee', borderRadius: 8 },
  skeletonImage: { height: 150, backgroundColor: '#ddd', borderRadius: 8, marginBottom: 10 },
  skeletonLine: { height: 14, backgroundColor: '#ddd', borderRadius: 6, marginBottom: 6 },
  skeletonLineShort: { height: 14, width: '60%', backgroundColor: '#ddd', borderRadius: 6 },
});
 