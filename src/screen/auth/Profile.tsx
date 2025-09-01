import React, { useState, useEffect } from "react";
import {View,Text,TextInput,TouchableOpacity,Image,ScrollView,StyleSheet,Alert,FlatList,ActivityIndicator,} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { RootState, AppDispatch } from "../../store/store";
import { updateProfile, fetchProfile } from "../../store/slices/authSlice";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {

  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, status, error } = useSelector(
    (state: RootState) => state.auth
  );
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Settings" as never)}
          style={{ marginRight: 16 }}
        >
          <MaterialIcons name="settings" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
      title: "My Profile",
      headerTitleAlign: "center",
    });
  }, [navigation]);

  useEffect(() => {
    if (!token) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  }, [token, navigation]);

  useEffect(() => {
    if (!user && token) dispatch(fetchProfile());
    else if (user) {
      setName(user.name);
      setPhoto(user.profilePhoto || "");
    }
  }, [dispatch, user, token]);

  useEffect(() => {
    if (error) Alert.alert("Error", error);
  }, [error]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setPhoto(uri); 
      try {
        setUpdating(true);
        await dispatch(
          updateProfile({
            name,
            photo: { uri, name: "profile.jpg", type: "image/jpeg" },
          })
        );
      } catch {
        Alert.alert("Error", "Failed to upload photo.");
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleSave = async () => {
    if (!/^[A-Za-z ]+$/.test(name)) {
      Alert.alert("Invalid Name", "Name must only contain letters and spaces.");
      return;
    }
    try {
      setUpdating(true);
      await dispatch(updateProfile({ name, photo: null }));
      Alert.alert("Success", "Profile updated!");
    } catch {
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  const renderDoc = ({ item }: { item: { name: string; url: string } }) => (
    <View style={styles.docCard}>
      <Image source={{ uri: item.url }} style={styles.docImage} />
      <Text style={styles.docName}>{item.name}</Text>
    </View>
  );

  if ((status === "loading" && !user) || !user) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.center}>
          <Image
            source={{
              uri: photo || "https://via.placeholder.com/120.png?text=Photo",
            }}
            style={styles.profilePhoto}
          />
          <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
            <MaterialIcons name="edit" size={22} color="#fff" />
          </TouchableOpacity>
          {updating && (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={styles.photoLoader}
            />
          )}
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Enter your name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.readonly}>{user.email}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.readonly}>{user.role}</Text>
          </View>
        </View>

        {user.landlordApplication && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Landlord Application</Text>
            <Text style={styles.statusText}>
              Status: {user.landlordApplication.status}
            </Text>
            {user.landlordApplication.rejectionReason && (
              <Text style={styles.rejectionText}>
                Reason: {user.landlordApplication.rejectionReason}
              </Text>
            )}
            <FlatList
              data={user.landlordApplication.docs}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderDoc}
              numColumns={2}
              columnWrapperStyle={styles.docRow}
            />
          </View>
        )}
        <View style={styles.card}>
          <Text style={styles.dateText}>
            Joined:{" "}
            {user.createdAt ? new Date(user.createdAt).toDateString() : "-"}
          </Text>
          <Text style={styles.dateText}>
            Last Updated:{" "}
            {user.updatedAt ? new Date(user.updatedAt).toDateString() : "-"}
          </Text>
        </View>
      </ScrollView>
      <TouchableOpacity
        style={[styles.saveButton, updating && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={updating}
      >
        <Text style={styles.saveButtonText}>
          {updating ? "Saving..." : "Save Changes"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  center: { alignItems: "center", justifyContent: "center", marginVertical: 20 },
  profilePhoto: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  photoLoader: { position: "absolute", top: "45%", left: "45%" },
  changePhotoText: { color: "#007AFF", marginTop: 8, fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#222" },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, color: "#555" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    color: "#333",
  },
  readonly: { fontSize: 16, paddingVertical: 8, color: "#555" },
  statusText: { fontSize: 16, fontWeight: "600", marginBottom: 5 },
  rejectionText: { color: "red", marginBottom: 10 },
  docRow: { justifyContent: "space-between" },
  docCard: { flex: 1, margin: 5, alignItems: "center" },
  docImage: { width: 120, height: 120, borderRadius: 12 },
  docName: { marginTop: 6, fontSize: 14, fontWeight: "500" },
  dateText: { fontSize: 14, color: "#777", marginBottom: 4 },
  saveButton: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
