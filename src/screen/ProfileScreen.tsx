import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Image, Alert, ScrollView, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { DocumentPickerAsset } from 'expo-document-picker';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {fetchProfile,editProfile,submitLandlordApplication,clearMessages,} from '../store/slices/profileSlice';

const ProfileScreen = () => {

  const dispatch = useAppDispatch();
  const { profile, loading, error, landlordApplicationMessage } = useAppSelector((state) => state.profile);
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [profilePhoto, setProfilePhoto] = useState<any>(null);
  const [docs, setDocs] = useState<{ uri: string; type: string; name: string }[]>([]);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      if (profile.profilePhoto) {
        setProfilePhoto({ uri: profile.profilePhoto });
      }
    }
  }, [profile]);

  useEffect(() => {
    if (error) Alert.alert('Error', error);
    if (landlordApplicationMessage) Alert.alert('Success', landlordApplicationMessage);

    return () => {
      dispatch(clearMessages());
    };
  }, [error, landlordApplicationMessage, dispatch]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please grant media library permissions.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets.length > 0) {
      setProfilePhoto(result.assets[0]);
    }
  };

  const pickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        multiple: true,
      });

      // Handle document selection using type property
      if (result.canceled) {
        console.log('Document picking cancelled');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const newDocs = result.assets.map((asset: DocumentPickerAsset) => ({
          uri: asset.uri,
          type: asset.mimeType || 'application/pdf',
          name: asset.name || 'document',
        }));
        setDocs(prev => [...prev, ...newDocs]);
      }
    } catch (error) {
      console.error('Document pick error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUpdateProfile = () => {
    dispatch(editProfile({ name, email, profilePhoto }));
  };

  const handleApplyForLandlord = () => {
    if (docs.length === 0) {
      Alert.alert('Error', 'Please upload at least one document.');
      return;
    }
    dispatch(submitLandlordApplication(docs));
  };

  const removeDocument = (index: number) => {
    setDocs(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        editable={false}
      />

      <Button 
        title="Pick Profile Photo" 
        onPress={pickImage} 
        disabled={loading}
      />
      
      {(profilePhoto || profile?.profilePhoto) && (
        <Image
          source={{ uri: profilePhoto?.uri || profile?.profilePhoto }}
          style={styles.profileImage}
        />
      )}

      <Button 
        title="Update Profile" 
        onPress={handleUpdateProfile} 
        disabled={loading} 
        color="#4CAF50"
      />

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Apply for Landlord</Text>
        <Text style={styles.note}>Upload required documents (ID, proof of address, etc.)</Text>

        <Button 
          title="Pick Documents" 
          onPress={pickDocuments} 
          disabled={loading}
        />
        
        {docs.map((doc, index) => (
          <View key={index} style={styles.docItem}>
            <Text style={styles.docName}>{doc.name}</Text>
            <Button 
              title="Remove" 
              onPress={() => removeDocument(index)} 
              color="#FF5252"
            />
          </View>
        ))}

        <Button
          title="Submit Application"
          onPress={handleApplyForLandlord}
          disabled={loading || docs.length === 0}
          color="#3F51B5"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginVertical: 16,
    alignSelf: 'center',
  },
  section: {
    marginVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  note: {
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  docItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 4,
    marginVertical: 4,
  },
  docName: {
    flex: 1,
    marginRight: 8,
  },
});

export default ProfileScreen;