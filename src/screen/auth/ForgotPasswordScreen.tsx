import React, { useState, useEffect } from 'react';
import {View, Text, TextInput, StyleSheet,ScrollView, ActivityIndicator, TouchableOpacity,KeyboardAvoidingView, Platform} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector }      from 'react-redux';
import { forgotPassword, clearError }    from '../../store/slices/authSlice';
import type { AppDispatch, RootState }   from '../../store/store';
import type { NativeStackScreenProps }    from '@react-navigation/native-stack';
import type { AuthStackParamList }        from '../../navigation/AuthNavigator';
import { colors, spacing, radii, fontSizes } from '../../style/shared/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

interface FormData {
  email: string;
}

export default function ForgotPasswordScreen({ navigation }: Props) {

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
  const dispatch = useDispatch<AppDispatch>();
  const { status, error: apiError } = useSelector((state: RootState) => state.auth);
  const [formError, setFormError] = useState<string>('');
  const [message, setMessage]     = useState<string>('');

  useEffect(() => {
    dispatch(clearError());
    setFormError('');
    setMessage('');
  }, [dispatch]);

  const onSubmit = async (data: FormData) => {
    setFormError('');
    setMessage('');

    if (!data.email) {
      setFormError('Please enter your email address.');
      return;
    }

    try {
      await dispatch(forgotPassword({ email: data.email })).unwrap();
      setMessage(
        'If an account with that email exists, you will receive a password reset link shortly.'
      );
    } catch (err: any) {
      setFormError(err || 'An unexpected error occurred.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <MaskedView
            maskElement={
              <Text style={[styles.title, { backgroundColor: 'transparent' }]}>
                Rentify
              </Text>
            }
          >
            <LinearGradient
              colors={[colors.purpleStart, colors.purpleEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.title, { opacity: 0 }]}>Rentify</Text>
            </LinearGradient>
          </MaskedView>

          <Text style={styles.subtitle}>Forgot your password?</Text>
          <Text style={styles.description}>
            Enter your email address and we’ll send you a link to reset your password.
          </Text>
          {formError ? (
            <Text style={styles.errorText}>{formError}</Text>
          ) : null}
          {apiError ? (
            <Text style={styles.errorText}>{apiError}</Text>
          ) : null}
          {message ? (
            <Text style={styles.successText}>{message}</Text>
          ) : null}
          <Controller
            control={control}
            name="email"
            defaultValue=""
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                editable={status !== 'loading'}
              />
            )}
          />
          {errors.email && (
            <Text style={styles.inputError}>Email is required</Text>
          )}
          {status === 'loading' ? (
            <ActivityIndicator style={{ marginTop: spacing.lg }} />
          ) : (
            <GradientButton
              onPress={handleSubmit(onSubmit)}
              title="Send Reset Link"
            />
          )}
          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Remembered your password? Login</Text>
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

// Gradient button component
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
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
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
  description: {
    fontSize: fontSizes.base,
    color: colors.gray700,
    textAlign: 'center',
    marginBottom: spacing.lg,
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
    fontSize: fontSizes.sm,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.red700,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  successText: {
    color: 'green',
    fontSize: fontSizes.sm,
    textAlign: 'center',
    marginBottom: spacing.sm,
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
    color: colors.purpleStart,
    fontSize: fontSizes.sm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
