import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch } from '../../store/hooks';
import { applyForLandlord } from '../../store/slices/authSlice';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootStackNavigator';

interface SelectedFile { uri: string; name: string; type: string; }

type ApplyForLandlordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MainTabs' 
>;

const ApplyForLandlord: React.FC = () => {

  const dispatch = useAppDispatch();
  const navigation = useNavigation<ApplyForLandlordScreenNavigationProp>();
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
        console.log('[DEBUG] Permission denied');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: Math.max(0, 5 - files.length),
      });

      if (!result.canceled && result.assets) {
        const getMimeType = (uri: string): string => {
          const extension = uri.split('.').pop()?.toLowerCase();
          if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
          if (extension === 'png') return 'image/png';
          return 'application/octet-stream';
        };
        const isImage = (uri: string) => {
          const ext = uri.split('.').pop()?.toLowerCase();
          return ext === 'jpg' || ext === 'jpeg' || ext === 'png';
        };

        const newFiles = result.assets
          .filter(asset => isImage(asset.uri))
          .map(asset => ({
            uri: asset.uri,
            name: asset.fileName || `image-${Date.now()}.${asset.uri.split('.').pop() || 'jpg'}`,
            type: asset.mimeType || getMimeType(asset.uri),
          }));

        if (newFiles.length !== result.assets.length) {
          Alert.alert('Invalid File', 'Only JPG and PNG images are allowed.');
        }

        setFiles(prev => {
          const updated = [...prev, ...newFiles].slice(0, 5);
          return updated;
        });
      } else {
        console.log('[DEBUG] Image picker canceled or no assets selected');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick images.');
    }
  };

  const removeImage = (index: number) => {
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      return updated;
    });
  };

  const handleSubmit = async () => {

    if (files.length === 0) {
      Alert.alert('Validation Error', 'You must upload at least one document.');
      return;
    }

    try {
      setLoading(true);
      await dispatch(applyForLandlord(files)).unwrap(); 
      Alert.alert(
        'Success', 
        'Your application has been submitted and is awaiting review.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('MainTabs');
            }
          }
        ]
      );
      
      setFiles([]);
    } catch (error: any) {
      const msg = typeof error === 'string' ? error : (error?.message || 'Something went wrong.');
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Become a Landlord</Text>
        <Text style={styles.description}>
          Before listing properties, please upload documents to verify your landlord status.
        </Text>
        <View style={styles.uploadSection}>
          <Text style={styles.uploadLabel}>Upload Documents</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImages} disabled={files.length >= 5}>
            <Text style={styles.uploadText}>
              {files.length > 0 ? 'Add More Files' : 'Select Files'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.uploadHint}>
            You can upload up to 5 images (ID, license, etc.). JPG/PNG only.
          </Text>
        </View>

        {files.length > 0 && (
          <View style={styles.imageGrid}>
            {files.map((file, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: file.uri }} style={styles.image} />
                <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={[styles.submitButton, loading && styles.disabledButton]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Application</Text>}
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By submitting, you agree to our <Text style={styles.linkText}>Terms & Conditions</Text>.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', color: '#111827' },
  description: { fontSize: 16, marginBottom: 24, textAlign: 'center', color: '#6b7280' },
  uploadSection: { marginBottom: 16 },
  uploadLabel: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#111827' },
  uploadButton: { borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#f3f4f6', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 8 },
  uploadText: { fontSize: 16, color: '#6b7280' },
  uploadHint: { fontSize: 14, color: '#6b7280' },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: 24, gap: 8 },
  imageContainer: { width: 100, height: 100, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeButton: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  removeButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, lineHeight: 16 },
  submitButton: { backgroundColor: '#2563eb', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 16 },
  disabledButton: { opacity: 0.7 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  termsText: { fontSize: 14, textAlign: 'center', color: '#6b7280' },
  linkText: { color: '#3b82f6', textDecorationLine: 'underline' },
});

export default ApplyForLandlord;