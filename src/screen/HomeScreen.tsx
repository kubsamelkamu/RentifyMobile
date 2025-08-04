// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { RootState } from '../store/rootReducer';
import { fetchStatus } from '../api/status';
import style from '../style/global';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus()
      .then(data => {
        setStatus(data.status);
      })
      .catch(err => {
        console.error('Status check failed:', err);
        setStatus('error');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={style.container}>
      <Text style={style.title}>Backend Status Check</Text>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <Text style={style.subtitle}>
          Status: {status}
        </Text>
      )}

      <Text style={style.subtitle}>
        Persisted token: {token ?? 'None'}
      </Text>

      <View style={style.buttonContainer}>
        <Button
          title="Set Dummy Token"
          onPress={() => dispatch(setCredentials({ token: 'abc123', role: 'tenant' }))}
        />
      </View>
    </View>
  );
}
