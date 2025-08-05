import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LandlordHomeScreen from '../screen/landlord/LandlordHomeScreen';

export type LandlordTabParamList = {
  LandlordHome: undefined;
};

const Tab = createBottomTabNavigator<LandlordTabParamList>();

export default function LandlordTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="LandlordHome"
        component={LandlordHomeScreen}
        options={{ title: 'Dashboard' }}
      />
    </Tab.Navigator>
  );
}
