import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AuthNavigator from './AuthNavigator';
import AdminTabNavigator from './AdminTabNavigator';
import LandlordTabNavigator from './LandlordTabNavigator';
import TenantTabNavigator from './TenantTabNavigator';
import type { RootState } from '../store/rootReducer';

export default function AppNavigator() {
  const { token, role } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      {token == null ? (
        // No token → show auth screens
        <AuthNavigator />
      ) : role === 'admin' ? (
        // Admin
        <AdminTabNavigator />
      ) : role === 'landlord' ? (
        // Landlord
        <LandlordTabNavigator />
      ) : (
        // Tenant
        <TenantTabNavigator />
      )}
    </NavigationContainer>
  );
}
