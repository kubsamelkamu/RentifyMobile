import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PropertyListScreen from '../screen/properties/PropertiesList';
import PropertyDetailScreen from '../screen/properties/PropertiesDetail';

export type TenantStackParamList = {
  PropertyList: undefined;
  PropertyDetail: { id: string };
};

const Stack = createNativeStackNavigator<TenantStackParamList>();

export default function TenantStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PropertyList" component={PropertyListScreen} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    </Stack.Navigator>
  );
}
