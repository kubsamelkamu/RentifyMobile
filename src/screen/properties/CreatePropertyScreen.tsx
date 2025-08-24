import React, { useState, useEffect } from 'react';
import {View,Text,TextInput,ScrollView,TouchableOpacity,ActivityIndicator,Alert,Image,StyleSheet,Platform,} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createProperty } from '../../store/slices/propertiesSlice';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootStackNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';

type CreatePropertyScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;

export default function CreatePropertyScreen() {

  const dispatch = useAppDispatch();
  const navigation = useNavigation<CreatePropertyScreenNavigationProp>();
  const { createStatus, createError } = useAppSelector((state) => state.properties);
  const { role, user } = useAppSelector((state) => state.auth);

  if (!user || role !== 'landlord') {
    return (
      <View style={styles.restrictedContainer}>
        <Text style={styles.restrictedTitle}>Landlord Access Required</Text>
        <Text style={styles.restrictedMessage}>
          You must be a landlord to create property listings. Apply to become a landlord
          and wait for admin approval.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('ApplyForLandlord' as never)}
          style={styles.applyButton}
        >
          <Text style={styles.applyButtonText}>Apply for Landlord</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [rentPerMonth, setRentPerMonth] = useState('');
  const [numBedrooms, setNumBedrooms] = useState('');
  const [numBathrooms, setNumBathrooms] = useState('');
  const [propertyType, setPropertyType] = useState<
    'APARTMENT' | 'HOUSE' | 'STUDIO' | 'VILLA'
  >('APARTMENT');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});


  const validateField = (name: string, value: string | number | string[]) => {
    let error = '';
    switch (name) {
      case 'title':
        if (!value) error = 'Title is required';
        else if (value.toString().trim().length < 3) error = 'Title must be at least 3 characters';
        break;
      case 'description':
        if (!value) error = 'Description is required';
        else if (value.toString().trim().length < 10) error = 'Description must be at least 10 characters';
        break;
      case 'city':
        if (!value) error = 'City is required';
        else if (value.toString().trim().length < 2) error = 'City must be at least 2 characters';
        break;
      case 'rentPerMonth':
        if (!value) error = 'Rent is required';
        else if (isNaN(Number(value))) error = 'Rent must be a number';
        else if (Number(value) <= 0) error = 'Rent must be positive';
        break;
      case 'numBedrooms':
        if (!value) error = 'Bedrooms is required';
        else if (isNaN(Number(value))) error = 'Must be a number';
        else if (Number(value) < 1) error = 'Must be at least 1';
        break;
      case 'numBathrooms':
        if (!value) error = 'Bathrooms is required';
        else if (isNaN(Number(value))) error = 'Must be a number';
        else if (Number(value) < 1) error = 'Must be at least 1';
        break;
      case 'images':
        if (!value || (Array.isArray(value) && value.length === 0))
          error = 'At least one image is required';
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const fields = [
      { name: 'title', value: title },
      { name: 'description', value: description },
      { name: 'city', value: city },
      { name: 'rentPerMonth', value: rentPerMonth },
      { name: 'numBedrooms', value: numBedrooms },
      { name: 'numBathrooms', value: numBathrooms },
      { name: 'images', value: images },
    ];
    let isValid = true;
    fields.forEach(field => {
      if (!validateField(field.name, field.value)) {
        isValid = false;
      }
    });
    return isValid;
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    switch (fieldName) {
      case 'title': validateField(fieldName, title); break;
      case 'description': validateField(fieldName, description); break;
      case 'city': validateField(fieldName, city); break;
      case 'rentPerMonth': validateField(fieldName, rentPerMonth); break;
      case 'numBedrooms': validateField(fieldName, numBedrooms); break;
      case 'numBathrooms': validateField(fieldName, numBathrooms); break;
      case 'images': validateField(fieldName, images); break;
    }
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
      });
      if (!result.canceled) {
        const uris = result.assets.map((asset) => asset.uri);
        setImages(uris);
        validateField('images', uris);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select images');
    }
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity));
  };

  const handleSubmit = async () => {
    const allFields = ['title', 'description', 'city', 'rentPerMonth', 'numBedrooms', 'numBathrooms', 'images'];
    allFields.forEach(field => setTouched(prev => ({ ...prev, [field]: true })));
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix all errors before submitting');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      city: city.trim(),
      rentPerMonth: Number(rentPerMonth),
      numBedrooms: Number(numBedrooms),
      numBathrooms: Number(numBathrooms),
      propertyType,
      amenities,
    };

    try {
      const resultAction = await dispatch(createProperty(payload));
      if (createProperty.fulfilled.match(resultAction)) {
        Alert.alert('Success', 'Property created successfully! Your property will be live on Rentify once approved.');
        setTitle('');
        setDescription('');
        setCity('');
        setRentPerMonth('');
        setNumBedrooms('');
        setNumBathrooms('');
        setPropertyType('APARTMENT');
        setAmenities([]);
        setImages([]);
        setErrors({});
        setTouched({});
        navigation.navigate('MainTabs');
      } else {
        let errorMessage = 'Failed to create property.';
        if (createError) errorMessage += `\nError: ${createError}`;
        if (resultAction.error) errorMessage += `\nAction Error: ${resultAction.error.message}`;
        Alert.alert('Error', errorMessage);
      }
    } catch{
      Alert.alert('Error', 'An unexpected error occurred during submission.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create New Property</Text>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.title && touched.title && styles.inputError]}
            placeholder="Property Title"
            value={title}
            onChangeText={setTitle}
            onBlur={() => handleBlur('title')}
          />
          {errors.title && touched.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.textArea, errors.description && touched.description && styles.inputError]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            onBlur={() => handleBlur('description')}
          />
          {errors.description && touched.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.city && touched.city && styles.inputError]}
            placeholder="City"
            value={city}
            onChangeText={setCity}
            onBlur={() => handleBlur('city')}
          />
          {errors.city && touched.city && <Text style={styles.errorText}>{errors.city}</Text>}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Property Details</Text>
        
        <View style={styles.row}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 12 }]}>
            <TextInput
              style={[styles.input, errors.rentPerMonth && touched.rentPerMonth && styles.inputError]}
              placeholder="Rent/Month"
              value={rentPerMonth}
              onChangeText={setRentPerMonth}
              keyboardType="numeric"
              onBlur={() => handleBlur('rentPerMonth')}
            />
            {errors.rentPerMonth && touched.rentPerMonth && <Text style={styles.errorText}>{errors.rentPerMonth}</Text>}
          </View>
          
          <View style={[styles.inputContainer, { flex: 1, marginRight: 12 }]}>
            <TextInput
              style={[styles.input, errors.numBedrooms && touched.numBedrooms && styles.inputError]}
              placeholder="Bedrooms"
              value={numBedrooms}
              onChangeText={setNumBedrooms}
              keyboardType="numeric"
              onBlur={() => handleBlur('numBedrooms')}
            />
            {errors.numBedrooms && touched.numBedrooms && <Text style={styles.errorText}>{errors.numBedrooms}</Text>}
          </View>
          
          <View style={[styles.inputContainer, { flex: 1 }]}>
            <TextInput
              style={[styles.input, errors.numBathrooms && touched.numBathrooms && styles.inputError]}
              placeholder="Bathrooms"
              value={numBathrooms}
              onChangeText={setNumBathrooms}
              keyboardType="numeric"
              onBlur={() => handleBlur('numBathrooms')}
            />
            {errors.numBathrooms && touched.numBathrooms && <Text style={styles.errorText}>{errors.numBathrooms}</Text>}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={[styles.pickerContainer, Platform.OS === 'ios' && styles.iosPickerContainer]}>
            <Picker
              selectedValue={propertyType}
              onValueChange={(itemValue) => setPropertyType(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Apartment" value="APARTMENT" />
              <Picker.Item label="House" value="HOUSE" />
              <Picker.Item label="Studio" value="STUDIO" />
              <Picker.Item label="Villa" value="VILLA" />
            </Picker>
          </View>
          <Text style={styles.hintText}>Select property type</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Amenities</Text>
        
        <View style={[styles.row, styles.amenityInputRow]}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 12 }]}
            placeholder="Add amenity (e.g., WiFi, Pool)"
            value={amenityInput}
            onChangeText={setAmenityInput}
          />
          <TouchableOpacity style={styles.addButton} onPress={addAmenity}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.amenitiesContainer}>
          {amenities.map((amenity, index) => (
            <View key={index} style={styles.amenityTag}>
              <Text style={styles.amenityText}>{amenity}</Text>
              <TouchableOpacity onPress={() => removeAmenity(amenity)}>
                <Text style={styles.removeAmenity}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Images</Text>
        
        <TouchableOpacity style={styles.imagePicker} onPress={pickImages}>
          <Text style={styles.imagePickerText}>Select Images</Text>
        </TouchableOpacity>
        
        {errors.images && touched.images && <Text style={styles.errorText}>{errors.images}</Text>}
        
        {images.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewContainer}>
            {images.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.imagePreview} />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>No images selected</Text>
          </View>
        )}
        <Text style={styles.hintText}>Select at least one image of your property</Text>
      </View>

      <TouchableOpacity 
        onPress={handleSubmit} 
        style={styles.submitButton}
        disabled={createStatus === 'loading'}
      >
        {createStatus === 'loading' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Create Property</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 20,
    textAlign: 'center',
  },
  // 🔹 Tenant restricted styles
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  restrictedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 12,
    textAlign: 'center',
  },
  restrictedMessage: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0284C7',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
  },
  inputContainer: {
    marginBottom: 16, 
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  amenityInputRow: {
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 4,
  },
  iosPickerContainer: {
    height: 120,
  },
  picker: {
    height: Platform.OS === 'android' ? 50 : 120,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  amenityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    color: '#0284C7',
    marginRight: 4,
  },
  removeAmenity: {
    color: '#0284C7',
    fontWeight: 'bold',
  },
  imagePicker: {
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePickerText: {
    color: '#0284C7',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginBottom: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  imagePlaceholder: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 12,
  },
  placeholderText: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  hintText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});