import React, { useState, useEffect } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,KeyboardAvoidingView,Platform,ScrollView,SafeAreaView,ActivityIndicator,Dimensions,} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState } from '../../store/store';
import { resetPassword, clearError } from '../../store/slices/authSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

export default function ResetPasswordScreen() {

  const dispatch = useDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute();
  const { status, error } = useSelector((state: RootState) => state.auth);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { token, email } = route.params as { token: string; email: string };

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  useEffect(() => {
    let strength = 0;
    if (newPassword.length >= 8) strength += 1;
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/[0-9]/.test(newPassword)) strength += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1;
    setPasswordStrength(strength);
  }, [newPassword]);

  const handleSubmit = async () => {
    setFormError('');

    if (!token) {
      setFormError('Reset token missing. Please verify OTP first.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setFormError('Please fill in both password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    if (passwordStrength < 3) {
      setFormError('Password is too weak. Include uppercase letters, numbers, and special characters.');
      return;
    }

    try {
      await dispatch(resetPassword({ token, newPassword }) as any).unwrap();
      setSuccess(true);
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, 3000);
    } catch (err: any) {
      if (err.response) {
        setFormError(err.response.data?.error || 'Password reset failed. Please try again.');
      } else {
        setFormError(err.message || 'Password reset failed. Please try again.');
      }
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength === 0) return '#E5E7EB';
    if (strength === 1) return '#EF4444';
    if (strength === 2) return '#F59E0B';
    if (strength === 3) return '#3B82F6';
    return '#10B981';
  };

  const getStrengthText = (strength: number) => {
    if (strength === 0) return 'Enter a password';
    if (strength === 1) return 'Weak password';
    if (strength === 2) return 'Medium password';
    if (strength === 3) return 'Strong password';
    return 'Very strong password';
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successCard}>
          <Ionicons name="checkmark-circle" size={48} color="#10B981" style={styles.successIcon} />
          <Text style={styles.successTitle}>Password Reset Successful!</Text>
          <Text style={styles.successText}>Redirecting to login page...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.title}>Reset Password</Text>
            {(formError) && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                <Ionicons name="lock-closed" size={18} color="#6366F1" style={styles.labelIcon} />
                New Password
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNew}
                />
                <TouchableOpacity
                  onPress={() => setShowNew(!showNew)}
                  style={styles.eyeButton}
                >
                  {showNew ? (
                    <Ionicons name="eye-off" size={20} color="#6B7280" />
                  ) : (
                    <Ionicons name="eye" size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
              
              {newPassword && (
                <View style={styles.passwordStrengthContainer}>
                  <View style={styles.strengthBarContainer}>
                    {[0, 1, 2, 3].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          { backgroundColor: i < passwordStrength ? getStrengthColor(passwordStrength) : '#E5E7EB' }
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[
                    styles.strengthText,
                    { color: getStrengthColor(passwordStrength) }
                  ]}>
                    {getStrengthText(passwordStrength)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                <Ionicons name="lock-closed" size={18} color="#6366F1" style={styles.labelIcon} />
                Confirm Password
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm(!showConfirm)}
                  style={styles.eyeButton}
                >
                  {showConfirm ? (
                    <Ionicons name="eye-off" size={20} color="#6B7280" />
                  ) : (
                    <Ionicons name="eye" size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
              
              {confirmPassword && newPassword !== confirmPassword && (
                <Text style={styles.passwordMismatchText}>Passwords don't match</Text>
              )}
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
                  <Text style={styles.submitButtonText}>Reset Password</Text>
                )}
              </LinearGradient>
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
    marginBottom: 24,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  eyeButton: {
    padding: 4,
  },
  passwordStrengthContainer: {
    marginTop: 8,
  },
  strengthBarContainer: {
    flexDirection: 'row',
    height: 4,
    marginBottom: 4,
    gap: 2,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
  },
  passwordMismatchText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    margin: 16,
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
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#6B7280',
  },
});