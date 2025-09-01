import React, { useState, useEffect } from "react";
import {View,Text,StyleSheet,FlatList,TextInput,TouchableOpacity,SafeAreaView,ActivityIndicator,KeyboardAvoidingView,Platform,Alert,} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import {fetchPropertyReviews,upsertReview,deleteReview,} from "../../store/slices/reviewSlice";
import socket, { connectSocket } from "../../utils/socket";

const PropertiesReview = ({ route }: any) => {

  const { propertyId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const reviewBucket = useSelector((state: RootState) => state.review.reviewsByProperty[propertyId]);
  const auth = useSelector((state: RootState) => state.auth);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    dispatch(fetchPropertyReviews({ propertyId, page: 1, limit: 10 }));
  }, [dispatch, propertyId]);

 
  useEffect(() => {
    const token = auth?.token;
    if (!token) return;

    connectSocket(token);

    const room = `reviews_${propertyId}`;
    socket.emit("joinRoom", room);

    const refresh = () =>
      dispatch(fetchPropertyReviews({ propertyId, page: 1, limit: 10 }));

    socket.on("admin:newReview", refresh);
    socket.on("admin:updateReview", refresh);
    socket.on("admin:deleteReview", refresh);

    return () => {
      socket.emit("leaveRoom", room);
      socket.off("admin:newReview", refresh);
      socket.off("admin:updateReview", refresh);
      socket.off("admin:deleteReview", refresh);
    };
  }, [propertyId, auth?.token, dispatch]);

  const handleSubmit = () => {
    if (!title.trim() || !comment.trim() || rating === 0) return;

    dispatch(upsertReview({ propertyId, rating, title, comment }))
      .unwrap()
      .then(() => {
        setRating(0);
        setTitle("");
        setComment("");
      })
      .catch((err) => console.error("upsertReview failed", err));
  };

  const handleDelete = (reviewId: string) => {
    Alert.alert("Delete Review", "Are you sure you want to delete this review?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          dispatch(deleteReview(propertyId))
            .unwrap()
            .catch((err) => console.error("deleteReview failed", err));
        },
      },
    ]);
  };

  const Star = ({ filled, size = 18, onPress }: any) => (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Text
        style={[styles.star, { fontSize: size }, filled ? styles.filledStar : styles.emptyStar]}
      >
        {filled ? "★" : "☆"}
      </Text>
    </TouchableOpacity>
  );

  const renderReview = ({ item }: any) => (
    <View style={styles.reviewCard}>
      <Text style={styles.reviewer}>{item.tenant?.name || "Anonymous"}</Text>
      <View style={styles.starsRow}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} filled={index < item.rating} size={18} />
        ))}
      </View>
      {item.title ? <Text style={styles.title}>{item.title}</Text> : null}
      <Text style={styles.comment}>{item.comment}</Text>

      {item.tenantId === auth.user?.id && (
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const reviews = reviewBucket?.reviews || [];
  const loading = reviewBucket?.loading || false;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <Text style={styles.header}>Property Reviews</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <FlatList
            data={reviews}
            scrollEnabled={false}
            keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
            renderItem={renderReview}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", marginTop: 20 }}>
                No reviews yet. Be the first to write one!
              </Text>
            }
          />
        )}

        <View style={styles.inputCard}>
          <Text style={styles.label}>Your Rating</Text>
          <View style={styles.starsRow}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} filled={index < rating} size={24} onPress={() => setRating(index + 1)} />
            ))}
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="Title (e.g., Great place!)"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={styles.textInput}
            placeholder="Write your review..."
            value={comment}
            onChangeText={setComment}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.submitBtn,
              (!title.trim() || !comment.trim() || rating === 0) && styles.disabledBtn,
            ]}
            onPress={handleSubmit}
            disabled={!title.trim() || !comment.trim() || rating === 0}
          >
            <Text style={styles.submitText}>Submit Review</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PropertiesReview;

const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: "#F9F9F9" },
  header: { fontSize: 20, fontWeight: "bold", margin: 16, textAlign: "center" },
  list: { paddingHorizontal: 16 },
  reviewCard: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  reviewer: { fontWeight: "bold", marginBottom: 4 },
  starsRow: { flexDirection: "row", marginVertical: 4 },
  star: { marginRight: 4 },
  filledStar: { color: "#FFD700" },
  emptyStar: { color: "#C0C0C0" },
  title: { fontSize: 16, fontWeight: "600", marginTop: 4 },
  comment: { fontSize: 14, color: "#444", marginTop: 4 },
  deleteBtn: {
    marginTop: 8,
    backgroundColor: "#FF4D4F",
    padding: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  deleteText: { color: "#FFF", fontWeight: "bold" },
  inputCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#E0E0E0",
  },
  label: { fontWeight: "bold", marginBottom: 8 },
  textInput: {
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    padding: 10,
    minHeight: 40,
    marginVertical: 8,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledBtn: { backgroundColor: "#C0C0C0" },
  submitText: { color: "#FFF", fontWeight: "bold" },
});
