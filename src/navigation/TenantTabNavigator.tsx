import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PropertyListScreen from '../screen/properties/PropertiesList';
import PropertyDetailScreen from '../screen/properties/PropertiesDetail';

export type TenantStackParamList = {
  PropertyList: undefined;
  PropertyDetail: { id: string };
  PropertyChat: { propertyId: string; landlordId: string };
};

const Stack = createNativeStackNavigator<TenantStackParamList>();

export default function TenantStackNavigator() {
  
  return (
    <Stack.Navigator>
      <Stack.Screen 
          name="PropertyList" 
          component={PropertyListScreen} 
          options={{
          headerTitle: 'Rentify',
          headerTitleStyle: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#0284C7', 
        },
          headerTitleAlign: 'left', 
          headerStyle: {
          backgroundColor: '#fff',
        },
      }}
      />
      <Stack.Screen 
        name="PropertyDetail" 
        component={PropertyDetailScreen} 
      />
    </Stack.Navigator>
  );
}
