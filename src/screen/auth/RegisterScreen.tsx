import React, { useEffect, useRef, useState } from 'react';
import {View, Text, TextInput, ActivityIndicator,StyleSheet, ScrollView, TouchableOpacity,KeyboardAvoidingView, Platform,} from 'react-native';
import Checkbox from 'expo-checkbox';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, registerUser, AuthState } from '../../store/slices/authSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { colors, spacing, radii, fontSizes } from '../../style/shared/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen({ navigation }: Props) {
  const { control, handleSubmit, setError } = useForm<RegisterForm>();
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector<RootState, AuthState['status']>(s => s.auth.status);
  const apiError = useSelector<RootState, AuthState['error']>(s => s.auth.error);

  const [agree, setAgree] = useState(false);

  const prevStatus = useRef<AuthState['status']>(status);
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (prevStatus.current !== 'succeeded' && status === 'succeeded') {
      const timer = setTimeout(() => {
        navigation.navigate('VerifyEmailInfo');
      }, 3000);
      return () => clearTimeout(timer);
    }
    prevStatus.current = status;
  }, [status, navigation]);

  const onSubmit = (data: RegisterForm) => {
    if (!agree) {
      setError('fullName', { message: 'You must agree to the terms.' });
      return;
    }
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    dispatch(registerUser({
      name: data.fullName,
      email: data.email,
      password: data.password,
    }));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <MaskedView maskElement={<Text style={[styles.title, { backgroundColor: 'transparent' }]}>Rentify</Text>}>
            <LinearGradient
              colors={[colors.purpleStart, colors.purpleEnd]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.title, { opacity: 0 }]}>Rentify</Text>
            </LinearGradient>
          </MaskedView>

          <Text style={styles.subtitle}>Create an account</Text>

          {apiError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{apiError}</Text>
            </View>
          )}
          <Controller
            control={control}
            name="fullName"
            defaultValue=""
            rules={{ required: 'Full name is required' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={value}
                  onChangeText={onChange}
                  editable={status !== 'loading'}
                />
                {error && <Text style={styles.inputError}>{error.message}</Text>}
              </>
            )}
          />
          <Controller
            control={control}
            name="email"
            defaultValue=""
            rules={{ required: 'Email is required' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  editable={status !== 'loading'}
                />
                {error && <Text style={styles.inputError}>{error.message}</Text>}
              </>
            )}
          />
          <Controller
            control={control}
            name="password"
            defaultValue=""
            rules={{ required: 'Password is required' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  editable={status !== 'loading'}
                />
                {error && <Text style={styles.inputError}>{error.message}</Text>}
              </>
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            defaultValue=""
            rules={{ required: 'Confirm your password' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  editable={status !== 'loading'}
                />
                {error && <Text style={styles.inputError}>{error.message}</Text>}
              </>
            )}
          />
          <View style={styles.checkboxContainer}>
            <Checkbox value={agree} onValueChange={setAgree} />
            <Text style={styles.checkboxText}>I agree to the Terms and Conditions</Text>
          </View>
          {status === 'loading' ? (
            <ActivityIndicator style={{ marginTop: spacing.lg }} />
          ) : (
            <GradientButton title="Register" onPress={handleSubmit(onSubmit)} />
          )}

          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Remembered your password? Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function GradientButton({
  onPress,
  title,
  disabled,
}: {
  onPress(): void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <LinearGradient
      colors={[colors.purpleStart, colors.purpleEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.buttonWrapper, disabled && { opacity: 0.5 }]}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={styles.buttonTouchable}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 448,
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: radii['3xl'],
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'stretch',
  },
  title: {
    fontSize: fontSizes.h1,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  subtitle: {
    fontSize: fontSizes.h2,
    fontWeight: '600',
    color: colors.gray700,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  errorBanner: {
    backgroundColor: colors.red50,
    padding: spacing.sm,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.red700,
    textAlign: 'center',
    fontSize: fontSizes.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: fontSizes.base,
    color: colors.black,
  },
  inputError: {
    color: colors.red700,
    marginBottom: spacing.sm,
    fontSize: fontSizes.sm,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  checkboxText: {
    marginLeft: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.gray700,
  },
  buttonWrapper: {
    borderRadius: radii.lg,
    marginTop: spacing.lg,
  },
  buttonTouchable: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: fontSizes.base,
  },
  linksContainer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    fontSize: fontSizes.sm,
    color: colors.purpleStart,
    marginTop: spacing.sm,
  },
});
