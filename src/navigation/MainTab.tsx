import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

import PropertyListScreen from "../screen/properties/PropertiesList";
import BookingScreen from "../screen/booking/BookingsScreen";
import CreatePropertyScreen from "../screen/properties/CreatePropertyScreen";
import ProfileScreen from "../screen/auth/Profile";

export type MainTabsParamList = {
  Home: undefined;
  Bookings: undefined;
  ListProperty: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export default function MainTabs() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: true,
          headerTitleAlign: "left",
          headerTitleStyle: {
            fontSize: 22,
            fontWeight: "700",
            color: "#0284C7",
          },
          tabBarStyle: {
            height: 65,
            backgroundColor: "#fff",
            borderTopWidth: 0.5,
            borderTopColor: "#ddd",
            paddingBottom: 6,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
          tabBarActiveTintColor: "#0284C7",
          tabBarInactiveTintColor: "#777",
          tabBarIcon: ({ color, size }) => {
            if (route.name === "Profile") {
              if (user?.profilePhoto) {
                return (
                  <Image
                    source={{ uri: user.profilePhoto }}
                    style={{
                      width: size + 8,
                      height: size + 8,
                      borderRadius: (size + 8) / 2,
                      borderWidth: 1,
                      borderColor: "#0284C7",
                    }}
                  />
                );
              } else if (user) {
                return (
                  <View
                    style={{
                      width: size + 8,
                      height: size + 8,
                      borderRadius: (size + 8) / 2,
                      backgroundColor: "#0284C7",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
                      {user.name[0].toUpperCase()}
                    </Text>
                  </View>
                );
              } else {
                return <Ionicons name="person-circle-outline" size={size + 4} color={color} />;
              }
            }

            let iconName: keyof typeof Ionicons.glyphMap = "home";
            if (route.name === "Home") iconName = "home-outline";
            else if (route.name === "Bookings") iconName = "calendar-outline";
            else if (route.name === "ListProperty") iconName = "business-outline";

            return <Ionicons name={iconName} size={size + 4} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Home"
          children={() => <PropertyListScreen isInTab />}
          options={{ tabBarLabel: "Home", headerTitle: "Rentify" }}
        />
        <Tab.Screen
          name="Bookings"
          component={BookingScreen}
          options={{ tabBarLabel: "Bookings", headerTitle: "My Bookings" }}
        />
        <Tab.Screen
          name="ListProperty"
          component={CreatePropertyScreen}
          options={{ tabBarLabel: "List Property", headerTitle: "List a Property" }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ tabBarLabel: "Profile", headerTitle: "My Profile" }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
