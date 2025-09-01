import React from "react";
import { useSelector } from "react-redux";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PropertyDetailScreen from "../screen/properties/PropertiesDetail";
import PropertyChatScreen from "../screen/chat/chatScreen";
import LoginScreen from "../screen/auth/LoginScreen";
import VerifyOtpScreen from "../screen/auth/verify-otp";
import VerifyResetOtpScreen from "../screen/auth/VerifyResetOtpScreen";
import RegisterScreen from "../screen/auth/RegisterScreen";
import ForgotPasswordScreen from "../screen/auth/ForgotPasswordScreen";
import ResetPasswordScreen from "../screen/auth/ResetPasswordScreen";
import AuthNavigator from "./AuthNavigator";
import AdminTabNavigator from "./AdminTabNavigator";
import LandlordTabNavigator from "./LandlordTabNavigator";
import TenantTabNavigator from "./TenantTabNavigator";
import ApplyForLandlord from "../screen/landlord/ApplyForLanlord";
import BookingScreen from "../screen/booking/BookingsScreen";
import MainTabs from "../navigation/MainTab";
import SettingScreen from '../screen/setting/SettingScreen';
import ProfileScreen from '../screen/auth/Profile'
import HelpSupportScreen from '../screen/setting/HelpSupportScreen'
import AboutScreen from '../screen/setting/AboutScreen'
import PrivacyPolicyScreen from '../screen/setting/PrivacyPolicyScreen'
import type { RootState } from "../store/store";

export type RootStackParamList = {

  MainTabs: undefined;
  PropertyDetail: { id: string };
  PropertyList: undefined;
  PropertyChat: { propertyId: string };
  Login: undefined;
  Register: undefined;
  VerifyOtp: { email: string };
  VerifyResetOtp: { email: string; type: "reset" };
  ForgotPassword: undefined;
  ResetPassword: { email: string; token: string };
  AuthStack: undefined;
  TenantTabs: undefined;
  LandlordTabs: undefined;
  AdminTabs: undefined;
  Booking: undefined;
  ApplyForLandlord: undefined;
  Settings: undefined;
  Profile: undefined; 
  HelpSupport: undefined;
  About: undefined;
  PrivacyPolicy: undefined;
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
        options={{ headerTitle: "Property Detail" }}
      />
      <Stack.Screen
        name="PropertyChat"
        component={PropertyChatScreen}
        options={{ headerTitle: "Property Chat" }}
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{ headerTitle: "My Bookings" }}
      />
      <Stack.Screen
        name="VerifyOtp"
        component={VerifyOtpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VerifyResetOtp"
        component={VerifyResetOtpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ headerTitle: "" }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ headerTitle: "" }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ headerTitle: "" }}
      />

      {!token && (
        <>
          <Stack.Screen
            name="AuthStack"
            component={AuthNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"   
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ headerShown: false }}
          />
        </>
      )}

      <Stack.Screen
        name="ApplyForLandlord"
        component={ApplyForLandlord}
        options={{ headerTitle: "Become a Landlord" }}
      />

      {token && role === "tenant" && (
        <Stack.Screen
          name="TenantTabs"
          component={TenantTabNavigator}
          options={{ headerShown: false }}
        />
      )}
      {token && role === "landlord" && (
        <Stack.Screen
          name="LandlordTabs"
          component={LandlordTabNavigator}
          options={{ headerShown: false }}
        />
      )}
      {token && role === "admin" && (
        <Stack.Screen
          name="AdminTabs"
          component={AdminTabNavigator}
          options={{ headerShown: false }}
        />
      )}

      <Stack.Screen
        name="Settings"
        component={SettingScreen}
        options={{ headerTitle: "Settings" }}
      />
    </Stack.Navigator>
  );
}