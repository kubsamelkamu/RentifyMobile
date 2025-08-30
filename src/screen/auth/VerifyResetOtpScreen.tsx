import React, { useState, useEffect } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,KeyboardAvoidingView,Platform,ScrollView,SafeAreaView,ActivityIndicator,} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState } from '../../store/store';
import { verifyOtp, verifyResetOtp, resendOtp, clearError } from '../../store/slices/authSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

export default function VerifyResetOtpScreen() {

  const dispatch = useDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute();
  const { status, error } = useSelector((state: RootState) => state.auth);
  const [otp, setOtp] = useState('');
  const [formError, setFormError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(30);
  const [otpResent] = useState(false);

  const { email, type = 'register' } = route.params as { 
    email: string; 
    type: 'register' | 'reset' 
  };

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  const handleSubmit = async () => {
    setFormError('');

    if (!email) {
      setFormError('Email missing. Please start the process again.');
      return;
    }

    if (!otp || otp.length !== 6) {
      setFormError('Please enter the 6-digit OTP.');
      return;
    }

    try {
      if (type === 'reset') {
        const result = await dispatch(verifyResetOtp({ email, otp }) as any).unwrap();
        if (result && result.resetToken) {
          navigation.navigate('ResetPassword', { 
            email, 
            token: result.resetToken 
          });
        } else {
          setFormError('No reset token returned. Please try again.');
        }
      } else {
        const result = await dispatch(verifyOtp({ email, otp }) as any).unwrap();
        navigation.navigate('Login');
      }
    } catch (err: any) {
      setFormError(err.message || 'OTP verification failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Rentify</Text>
          </View>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              {email ? (
                <>We sent a 6-digit code to <Text style={styles.emailText}>{email}</Text></>
              ) : (
                <>We sent a 6-digit code to your email.</>
              )}
            </Text>
            {(formError) && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color="#ef4444" />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            )}

            {otpResent && (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>OTP has been resent to your email.</Text>
              </View>
            )}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                <MaterialCommunityIcons name="key" size={18} color="#6366F1" style={styles.labelIcon} />
                6-digit OTP
              </Text>
              <TextInput
                style={styles.input}
                placeholder="••••••"
                value={otp}
                onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
                keyboardType="numeric"
                maxLength={6}
                autoFocus
                textAlign="center"
              />
            </View>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={status === 'loading'}
            >
              <LinearGradient
                colors={['#8B5CF6', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.submitButton, status === 'loading' && styles.submitButtonDisabled]}
              >
                {status === 'loading' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Verify</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.differentEmailButton}
              onPress={() => navigation.navigate(
                type === 'reset' ? 'ForgotPassword' : 'Register'
              )}
            >
              <Text style={styles.differentEmailText}>
                Use a different email
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emailText: {
    fontWeight: '600',
    color: '#4B5563',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    marginLeft: 8,
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#059669',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelIcon: {
    marginRight: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    backgroundColor: '#F9FAFB',
    letterSpacing: 8,
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    color: '#6B7280',
    fontSize: 14,
  },
  resendLink: {
    color: '#8B5CF6',
    fontWeight: '600',
    fontSize: 14,
  },
  resendLinkDisabled: {
    opacity: 0.5,
  },
  differentEmailButton: {
    alignItems: 'center',
  },
  differentEmailText: {
    color: '#8B5CF6',
    fontWeight: '600',
    fontSize: 14,
  },
});