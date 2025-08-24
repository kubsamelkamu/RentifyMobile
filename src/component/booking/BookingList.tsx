import React from "react";
import {View,Text,FlatList,ActivityIndicator,TouchableOpacity,StyleSheet,RefreshControl,} from "react-native";

interface BookingListProps {
  data: any[];
  role: "tenant" | "landlord" | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hasMore: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  onPressItem: (booking: any) => void;
}

const BookingList: React.FC<BookingListProps> = ({data,role,loading,refreshing,error,onRefresh,onEndReached,onPressItem,}) => {
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPressItem(item)}
    >
      <Text style={styles.title}>
        {role === "landlord"
          ? `Tenant: ${item.tenant?.name || "Unknown"}`
          : `Property: ${item.property?.title || "Unknown"}`}
      </Text>
      <Text>Status: {item.status}</Text>
      {item.paymentStatus && (
        <Text>Payment: {item.paymentStatus}</Text>
      )}
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  };

  if (error && data.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No bookings found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 10 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.2}
      ListFooterComponent={renderFooter}
    />
  );
};

export default BookingList;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  footer: {
    paddingVertical: 10,
    alignItems: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  empty: {
    fontSize: 16,
    color: "#666",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  retryText: {
    color: "#fff",
  },
});
