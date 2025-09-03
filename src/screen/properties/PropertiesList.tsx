import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStackNavigator';
import { fetchPropertiesThunk, likeProperty, unlikeProperty } from '../../store/slices/propertiesSlice';
import { logout } from '../../store/slices/authSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { Property } from '../../api/properties';
import HeroSection from '../../component/HeroSection';
import FilterPanel, { PropertyFilters } from '../../component/FilterPanel';
import { fetchPropertyReviews } from '../../store/slices/reviewSlice';
import socket, { connectSocket, disconnectSocket } from '../../utils/socket';

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
  const { items, status, total, limit } = useSelector((state: RootState) => state.properties);
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { reviewsByProperty } = useSelector((s: RootState) => s.review);
  const requested = useRef<Set<string>>(new Set());
  const navigation = useNavigation<StackNavProp>();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set());

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

  useEffect(() => {
    if (!items?.length) return;

    items.forEach((prop) => {
      const id = prop.id;
      const hasBucket = !!reviewsByProperty[id];
      if (!hasBucket && !requested.current.has(id)) {
        requested.current.add(id);
        dispatch(fetchPropertyReviews({ propertyId: id, page: 1, limit: 1 }));
      }
    });
  }, [items, reviewsByProperty, dispatch]);

  useEffect(() => {
    if (!token) return;

    const reload = () => {
      dispatch(fetchPropertiesThunk({ ...filters, page, limit }));
    };

    connectSocket(token);

    socket.on("listing:approved", reload);
    socket.on("listing:pending", reload);

    return () => {
      socket.off("listing:approved", reload);
      socket.off("listing:pending", reload);
      disconnectSocket();
    };
  }, [token, dispatch, filters, page, limit]);

  const toggleLike = (propId: string, isLiked: boolean) => {
    if (!user?.id) {
      Alert.alert('Login Required', 'You must be logged in to like properties.');
      return;
    }
    
    if (likingIds.has(propId)) return;

    setLikingIds(prev => new Set(prev).add(propId));

    const action = isLiked ? unlikeProperty(propId) : likeProperty(propId);
    dispatch(action)
      .unwrap()
      .catch(error => {
        Alert.alert('Error', error || 'Failed to update like status');
      })
      .finally(() => {
        setLikingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(propId);
          return newSet;
        });
      });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    requested.current.clear();
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
    ({ item }: { item: Property }) => {
      const bucket = reviewsByProperty[item.id];
      const isLiking = likingIds.has(item.id);

      return (
        <View style={styles.card}>
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={() => goToDetail(item.id)}>
              {item.images[0]?.url && (
                <Image source={{ uri: item.images[0].url }} style={styles.cardImage} resizeMode="cover" />
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.cardBody}>
            {/* Combined rating and like row */}
            <View style={styles.ratingLikeRow}>
              {/* Rating Section */}
              {bucket?.loading ? (
                <Text style={styles.reviewLoading}>Loading reviews…</Text>
              ) : (
                <View style={styles.reviewRow}>
                  <Ionicons name="star" size={14} color="#FACC15" />
                  <Text style={styles.reviewText}>
                    {bucket?.averageRating != null ? bucket.averageRating.toFixed(1) : '—'}
                  </Text>
                  <Text style={styles.reviewCount}>
                    ({bucket?.count ?? 0})
                  </Text>
                </View>
              )}

              {/* Like Button */}
              <TouchableOpacity
                style={styles.likeButton}
                onPress={() => toggleLike(item.id, item.likedByUser || false)}
                disabled={isLiking || !user?.id}
              >
                {isLiking ? (
                  <ActivityIndicator size="small" color="#FF3B30" />
                ) : (
                  <View style={styles.likeButtonContent}>
                    <Ionicons
                      name={item.likedByUser ? "heart" : "heart-outline"}
                      size={20}
                      color={item.likedByUser ? "#FF3B30" : "#666"}
                    />
                    <Text style={[
                      styles.likeCount,
                      { color: item.likedByUser ? "#FF3B30" : "#666" }
                    ]}>
                      {item.likesCount || 0}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            {/* End of combined row */}

            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.city}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="bed-outline" size={16} color="#666" />
                <Text style={styles.metaText}>{item.numBedrooms}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="water-outline" size={16} color="#666" />
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
      );
    },
    [goToDetail, reviewsByProperty, likingIds, user]
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
  container: { 
    paddingBottom: 20, 
    backgroundColor: '#FFFFFF' 
  },
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
  imageContainer: {
    position: 'relative',
  },
  cardImage: { 
    width: '100%', 
    height: 150 
  },
  cardBody: { 
    padding: 12 
  },
  ratingLikeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  reviewRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  reviewText: { 
    marginLeft: 4, 
    fontSize: 12, 
    fontWeight: '500' 
  },
  reviewCount: { 
    marginLeft: 4, 
    fontSize: 12, 
    color: '#666' 
  },
  reviewLoading: { 
    fontSize: 12, 
    color: '#888', 
    marginBottom: 6 
  },
  likeButton: {
    padding: 4,
  },
  likeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 4 
  },
  cardSubtitle: { 
    fontSize: 14, 
    color: '#555', 
    marginBottom: 8 
  },
  cardPrice: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#333', 
    marginTop: 8 
  },
  metaRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  metaItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 16 
  },
  metaText: { 
    marginLeft: 4, 
    fontSize: 14, 
    color: '#555' 
  },
  typeBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    backgroundColor: '#E0F2FE', 
    borderRadius: 12 
  },
  badgeText: { 
    fontSize: 12, 
    color: '#0284C7' 
  },
  detailButton: { 
    backgroundColor: '#0284C7', 
    paddingVertical: 8, 
    borderRadius: 5, 
    alignItems: 'center',
    marginTop: 12,
  },
  detailButtonText: { 
    color: '#FFF', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  emptyContainer: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  emptyEmoji: { 
    fontSize: 48, 
    marginBottom: 16 
  },
  emptyTitle: { 
    fontSize: 20, 
    fontWeight: '600', 
    marginBottom: 8 
  },
  emptySubtitle: { 
    fontSize: 14, 
    color: '#666', 
    textAlign: 'center' 
  },
  skeletonCard: { 
    padding: 15, 
    marginHorizontal: 16, 
    marginBottom: 16, 
    backgroundColor: '#eee', 
    borderRadius: 8 
  },
  skeletonImage: { 
    height: 150, 
    backgroundColor: '#ddd', 
    borderRadius: 8, 
    marginBottom: 10 
  },
  skeletonLine: { 
    height: 14, 
    backgroundColor: '#ddd', 
    borderRadius: 6, 
    marginBottom: 6 
  },
  skeletonLineShort: { 
    height: 14, 
    width: '60%', 
    backgroundColor: '#ddd', 
    borderRadius: 6 
  },
});