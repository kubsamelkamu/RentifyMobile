import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PropertyListScreen from '../screen/properties/PropertiesList';
import BookingScreen from '../screen/booking/BookingsScreen';

export type MainTabsParamList = {
  Home: undefined;
  Bookings: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export default function MainTabs() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: true,
          headerTitleAlign: 'left',
          headerTitleStyle: {
            fontSize: 22,
            fontWeight: '700',
            color: '#0284C7',
          },
          tabBarStyle: {
            height: 65,
            backgroundColor: '#fff',
            borderTopWidth: 0.5,
            borderTopColor: '#ddd',
            paddingBottom: 6,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarActiveTintColor: '#0284C7',
          tabBarInactiveTintColor: '#777',
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';

            if (route.name === 'Home') {
              iconName = 'home-outline';
            } else if (route.name === 'Bookings') {
              iconName = 'calendar-outline';
            } else if (route.name === 'Profile') {
              iconName = 'person-circle-outline';
            }

            return <Ionicons name={iconName} size={size + 4} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Home"
          children={() => <PropertyListScreen isInTab />}
          options={{ tabBarLabel: 'Home', headerTitle: 'Rentify' }}
        />
        <Tab.Screen
          name="Bookings"
          component={BookingScreen}
          options={{ tabBarLabel: 'Bookings', headerTitle: 'My Bookings' }}
        />
        <Tab.Screen
          name="Profile"
          children={() => (
            <View style={styles.placeholder}>
              <Text style={{ fontSize: 16, fontWeight: '500' }}>Profile Screen Placeholder</Text>
            </View>
          )}
          options={{ tabBarLabel: 'Profile', headerTitle: 'Profile' }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
