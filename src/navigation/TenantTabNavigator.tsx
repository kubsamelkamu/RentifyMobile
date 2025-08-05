import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TenantHomeScreen from '../screen/tenant/TenantHomeScreen';

export type TenantTabParamList = {
  TenantHome: undefined;
};

const Tab = createBottomTabNavigator<TenantTabParamList>();

export default function TenantTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="TenantHome"
        component={TenantHomeScreen}
        options={{ title: 'Dashboard' }}
      />
    </Tab.Navigator>
  );
}
