import React from 'react';
import { useSelector } from 'react-redux';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PropertyDetailScreen from '../screen/properties/PropertiesDetail';
import PropertyChatScreen from '../screen/chat/chatScreen'
import LoginScreen from '../screen/auth/LoginScreen';
import RegisterScreen from '../screen/auth/RegisterScreen';
import ForgotPasswordScreen from '../screen/auth/ForgotPasswordScreen';
import AuthNavigator from './AuthNavigator';
import AdminTabNavigator from './AdminTabNavigator';
import LandlordTabNavigator from './LandlordTabNavigator';
import TenantTabNavigator from './TenantTabNavigator';
import ApplyForLandlord from '../screen/landlord/ApplyForLanlord';
import BookingScreen from '../screen/booking/BookingsScreen';
import MainTabs from '../navigation/MainTab';
import type { RootState } from '../store/store';

export type RootStackParamList = {
  MainTabs: undefined;
  PropertyDetail: { id: string };
  PropertyChat: { propertyId: string }; 
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  AuthStack: undefined;
  TenantTabs: undefined;
  LandlordTabs: undefined;
  AdminTabs: undefined;
  Booking: undefined;
  ApplyForLandlord: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {

  const { token, role } = useSelector((state: RootState) => state.auth);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PropertyDetail"
        component={PropertyDetailScreen}
        options={{ headerTitle: 'Property Detail' }}
      />
      <Stack.Screen
        name="PropertyChat"
        component={PropertyChatScreen}
        options={{ headerTitle: 'Property Chat' }} 
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{ headerTitle: 'My Bookings' }}
      />
      {!token && (
        <>
          <Stack.Screen
            name="AuthStack"
            component={AuthNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerTitle: 'Login' }} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
      <Stack.Screen
        name="ApplyForLandlord"
        component={ApplyForLandlord}
        options={{ headerTitle: 'Become a Landlord' }}
      />
      {token && role === 'tenant' && (
        <Stack.Screen name="TenantTabs" component={TenantTabNavigator} options={{ headerShown: false }} />
      )}
      {token && role === 'landlord' && (
        <Stack.Screen name="LandlordTabs" component={LandlordTabNavigator} options={{ headerShown: false }} />
      )}
      {token && role === 'admin' && (
        <Stack.Screen name="AdminTabs" component={AdminTabNavigator} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}
