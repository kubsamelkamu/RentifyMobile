import React, { useState, useEffect } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,LayoutAnimation,Platform,UIManager,} from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface PropertyFilters {
  city?: string;
  priceRange?: [number, number];
  bedrooms?: [number, number];
  propertyType?: string;
  amenities?: string[];
}

interface FilterPanelProps {
  initial?: PropertyFilters;
  onApply: (filters: PropertyFilters) => void;
  onReset?: () => void;
  onCityChange?: (city: string) => void;
}

const PROPERTY_TYPES = [
  { label: 'Any', value: '' },
  { label: 'Apartment', value: 'APARTMENT' },
  { label: 'House', value: 'HOUSE' },
  { label: 'Studio', value: 'STUDIO' },
  { label: 'Villa', value: 'VILLA' },
];

const AMENITIES = ['WiFi', 'Parking', 'Pool', 'Gym', 'Pet Friendly'];

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function FilterPanel({
  initial = {},
  onApply,
  onReset,
  onCityChange,
}: FilterPanelProps) {
  const [city, setCity] = useState(initial.city || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceLow, setPriceLow] = useState(initial.priceRange?.[0] ?? 5000);
  const [priceHigh, setPriceHigh] = useState(initial.priceRange?.[1] ?? 100000);
  const [bedsMin, setBedsMin] = useState(initial.bedrooms?.[0] ?? 1);
  const [bedsMax, setBedsMax] = useState(initial.bedrooms?.[1] ?? 10);
  const [type, setType] = useState(initial.propertyType ?? '');
  const [amenities, setAmenities] = useState<string[]>(initial.amenities ?? []);

  const toggleAdvanced = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAdvanced(v => !v);
  };

  const resetAll = () => {
    setCity('');
    setPriceLow(5000);
    setPriceHigh(100000);
    setBedsMin(1);
    setBedsMax(10);
    setType('');
    setAmenities([]);
    onReset?.();
    onCityChange?.('');
  };

  const applyFilters = () => {
    onApply({
      city: city || undefined,
      priceRange: [priceLow, priceHigh],
      bedrooms: [bedsMin, bedsMax],
      propertyType: type || undefined,
      amenities: amenities.length ? amenities : undefined,
    });
  };

  const toggleAmenity = (amen: string) => {
    setAmenities(curr =>
      curr.includes(amen) ? curr.filter(a => a !== amen) : [...curr, amen]
    );
  };

  useEffect(() => onCityChange?.(city), [city]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Ionicons name="home-outline" size={20} color="#555" style={{ marginRight: 8 }}/>
        <TextInput
          style={styles.textInput}
          placeholder="Search by city"
          value={city}
          onChangeText={setCity}
        />
      </View>
      <TouchableOpacity onPress={toggleAdvanced} style={styles.toggleBtn}>
        <Text style={styles.toggleText}>
          {showAdvanced ? 'Hide Filters' : 'Show Filters'}
        </Text>
      </TouchableOpacity>

      {showAdvanced && (
        <View style={styles.advanced}>
          <Text style={styles.label}>Price Range (ETB)</Text>
          <View style={styles.sliderRow}>
            <Text>{priceLow}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={200000}
              step={5000}
              value={priceLow}
              onValueChange={setPriceLow}
            />
            <Text>{priceHigh}</Text>
          </View>
          <View style={styles.sliderRow}>
            <Text>{priceLow}</Text>
            <Slider
              style={styles.slider}
              minimumValue={priceLow}
              maximumValue={200000}
              step={5000}
              value={priceHigh}
              onValueChange={setPriceHigh}
            />
            <Text>{priceHigh}</Text>
          </View>
          <Text style={styles.label}>Bedrooms</Text>
          <View style={styles.sliderRow}>
            <Text>{bedsMin}</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={12}
              step={1}
              value={bedsMin}
              onValueChange={setBedsMin}
            />
            <Text>{bedsMax}</Text>
          </View>
          <View style={styles.sliderRow}>
            <Text>{bedsMin}</Text>
            <Slider
              style={styles.slider}
              minimumValue={bedsMin}
              maximumValue={12}
              step={1}
              value={bedsMax}
              onValueChange={setBedsMax}
            />
            <Text>{bedsMax}</Text>
          </View>
          <Text style={styles.label}>Property Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={type}
              onValueChange={setType}
              style={styles.picker}
            >
              {PROPERTY_TYPES.map(o => (
                <Picker.Item key={o.value} label={o.label} value={o.value} />
              ))}
            </Picker>
          </View>
          <Text style={styles.label}>Amenities</Text>
          <View style={styles.amenitiesRow}>
            {AMENITIES.map(a => {
              const sel = amenities.includes(a);
              return (
                <TouchableOpacity
                  key={a}
                  onPress={() => toggleAmenity(a)}
                  style={[
                    styles.amenityBtn,
                    sel && styles.amenityBtnSelected,
                  ]}
                >
                  <Text style={sel ? styles.amenityTextSel : styles.amenityText}>
                    {a}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={resetAll} style={styles.resetBtn}>
              <Text>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={applyFilters} style={styles.applyBtn}>
              <Text style={{ color: '#fff' }}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFF',
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  toggleBtn: { alignSelf: 'center', marginVertical: 4 },
  toggleText: { color: '#007AFF' },
  advanced: { marginTop: 8 },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 4 },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  slider: { flex: 1, marginHorizontal: 8 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    overflow: 'hidden',
  },
  picker: { height: 40, width: '100%' },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 4,
  },
  amenityBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 12,
    margin: 4,
  },
  amenityBtnSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  amenityText: { color: '#333' },
  amenityTextSel: { color: '#FFF' },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  resetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CCC',
    marginRight: 8,
  },
  applyBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
});
