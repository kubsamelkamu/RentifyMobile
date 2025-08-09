import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PropertyListScreen from '../screen/properties/PropertiesList';
import PropertyDetailScreen from '../screen/properties/PropertiesDetail'
import LoginScreen from '../screen/auth/LoginScreen';
import RegisterScreen from '../screen/auth/RegisterScreen';
import ForgotPasswordScreen from '../screen/auth/ForgotPasswordScreen';
import AuthNavigator from './AuthNavigator';
import AdminTabNavigator from './AdminTabNavigator';
import LandlordTabNavigator from './LandlordTabNavigator';
import TenantTabNavigator from './TenantTabNavigator';

import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

export type RootStackParamList = {
  PropertyList: undefined;
  PropertyDetail: { id: string };
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  AuthStack: undefined;
  TenantTabs: undefined;
  LandlordTabs: undefined;
  AdminTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {

  const { token, role } = useSelector((state: RootState) => state.auth);
  
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
          headerShown: true ,
          headerTitleAlign: 'left', 
          headerStyle: {
          backgroundColor: '#fff',
        },
      }}
      />
      <Stack.Screen
        name="PropertyDetail"
        component={PropertyDetailScreen}
        options={{ headerTitle: 'Property Detail' }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerTitle: 'Login' }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
       />
      <Stack.Screen 
        name="ForgotPassword"
        component={ForgotPasswordScreen} 
      />
      {token && role === 'tenant' && (
        <Stack.Screen
          name="TenantTabs"
          component={TenantTabNavigator}
          options={{ headerShown: false }}
        />
      )}
      {token && role === 'landlord' && (
        <Stack.Screen
          name="LandlordTabs"
          component={LandlordTabNavigator}
          options={{ headerShown: false }}
        />
      )}
      {token && role === 'admin' && (
        <Stack.Screen
          name="AdminTabs"
          component={AdminTabNavigator}
          options={{ headerShown: false }}
        />
      )}
      {!token && (
        <Stack.Screen
          name="AuthStack"
          component={AuthNavigator}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}
