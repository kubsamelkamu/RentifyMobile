import React from 'react';
import { View, Text, Button } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import type { AppDispatch } from '../../store/store';
import style from '../../style/global';

export default function LandlordHomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  return (
    <View style={style.container}>
      <Text style={style.title}>Landlord Dashboard</Text>
      <Button title="Logout" onPress={() => dispatch(logout())} />
    </View>
  );
}
