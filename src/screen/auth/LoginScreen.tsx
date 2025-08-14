import React, { useEffect, useRef } from 'react';
import {View,Text,TextInput,ActivityIndicator,StyleSheet,ScrollView,TouchableOpacity,KeyboardAvoidingView,Platform,} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, loginUser } from '../../store/slices/authSlice';
import { fetchPropertiesThunk } from '../../store/slices/propertiesSlice';
import type { RootState, AppDispatch } from '../../store/store';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootStackNavigator';
import { colors, spacing, radii, fontSizes } from '../../style/shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen({ navigation }: Props) {

  const { control, handleSubmit } = useForm<LoginForm>();
  const dispatch = useDispatch<AppDispatch>();
  const { status, error: apiError, token, user } = useSelector((state: RootState) => state.auth);
  const isMountedRef = useRef(true);

  useEffect(() => {
    dispatch(clearError());
    return () => {
      isMountedRef.current = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      dispatch(fetchPropertiesThunk({ page: 1, limit: 10 }));
      navigation.reset({
        index: 0,
        routes: [{ name: 'PropertyList' }],
      });
    }
  }, [token, navigation, dispatch]);

  const onSubmit = (data: LoginForm) => {
    dispatch(loginUser(data))
      .unwrap()
      .then((res) => console.log('Logged in user:', res.user))
      .catch((err) => console.log('Login failed:', err));
  };

  const clearErrorHandler = () => {
    dispatch(clearError());
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <MaskedView
            maskElement={<Text style={[styles.title, { backgroundColor: 'transparent' }]}>Rentify</Text>}
          >
            <LinearGradient colors={[colors.purpleStart, colors.purpleEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={[styles.title, { opacity: 0 }]}>Rentify</Text>
            </LinearGradient>
          </MaskedView>
          <Text style={styles.subtitle}>Welcome back!</Text>

          {apiError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{apiError}</Text>
            </View>
          )}

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
                  onChangeText={(text) => {
                    clearErrorHandler();
                    onChange(text);
                  }}
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
                  onChangeText={(text) => {
                    clearErrorHandler();
                    onChange(text);
                  }}
                  editable={status !== 'loading'}
                />
                {error && <Text style={styles.inputError}>{error.message}</Text>}
              </>
            )}
          />
          {status === 'loading' ? (
            <ActivityIndicator style={{ marginTop: spacing.lg }} />
          ) : (
            <GradientButton onPress={handleSubmit(onSubmit)} title="Login"  />
          )}
          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.linkText}>Forgot Your Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>Don’t have an account? Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function GradientButton({ onPress, title, disabled }: { onPress(): void; title: string; disabled?: boolean }) {
  return (
    <LinearGradient
      colors={[colors.purpleStart, colors.purpleEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.buttonWrapper, disabled && { opacity: 0.5 }]}
    >
      <TouchableOpacity onPress={onPress} disabled={disabled} style={styles.buttonTouchable}>
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
