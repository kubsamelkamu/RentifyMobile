import React, { useEffect, useRef, useState } from "react";
import {View,Text,TextInput,TouchableOpacity,KeyboardAvoidingView,Platform,StyleSheet,ActivityIndicator,ScrollView,Dimensions,Alert,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { verifyOtp, resendOtp, setAuth } from "../../store/slices/authSlice";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { AuthStackParamList } from "../../navigation/AuthNavigator";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, radii, fontSizes } from "../../style/shared/theme";

type VerifyOtpRouteProp = RouteProp<AuthStackParamList, "VerifyOtp">;

export default function VerifyOtpScreen() {

  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<VerifyOtpRouteProp>();
  const emailFromStore = useAppSelector((state) => state.auth.email);
  const email = route.params?.email || emailFromStore || "";
  const authState = useAppSelector((state) => state.auth);
  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [resendLoading, setResendLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { width, height } = Dimensions.get("window");
  const isSmallScreen = width < 375;

  useEffect(() => {
    if (!email) {
      navigation.reset({ index: 0, routes: [{ name: "Login" as never }] });
    }
  }, [email, navigation]);

  useEffect(() => {
    if (authState.user && authState.token) {
      navigation.reset({ index: 0, routes: [{ name: "MainTabs" as never }] });
    }
  }, [authState.user, authState.token, navigation]);


  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter a complete 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");

    try {
      console.log("Attempting OTP verification with:", { email, otp });
      
      const resultAction = await dispatch(verifyOtp({ email, otp }));      
      if (verifyOtp.fulfilled.match(resultAction)) {
        const { token, user } = resultAction.payload;
        console.log("OTP verification successful:", { token, user });
        
        if (token && user) {
          dispatch(setAuth({ token, user }));
          navigation.reset({ index: 0, routes: [{ name: "MainTabs" as never }] });
        } else {
          setError("OTP verification failed - missing token or user");
        }
      } else {
        const payloadMessage = resultAction.payload as string;
        if (payloadMessage === "User already verified") {
          setError("Account already verified, please login manually."); 
        } else {
          setError(payloadMessage || "OTP verification failed");
          Alert.alert(
            "OTP Verification Failed", 
            `Error: ${payloadMessage}\n\nEmail: ${email}\nOTP: ${otp}`,
            [{ text: "OK" }]
          );
        }
      }
    } catch (err) {
      setError("OTP verification failed");
      Alert.alert(
        "OTP Verification Error", 
        `Unexpected error: ${JSON.stringify(err)}`,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || resendLoading) return;

    setResendLoading(true);
    setError("");

    try {
      await dispatch(resendOtp({ email })).unwrap();
      setResendCountdown(30);
      setOtp("");
      inputRef.current?.focus();
    } catch (err) {
      setError("Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { minHeight: height }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, isSmallScreen && styles.cardSmall]}>
          <View style={styles.header}>
            <LinearGradient
              colors={[colors.purpleStart, colors.purpleEnd]}
              style={styles.iconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="lock-closed" size={32} color="white" />
            </LinearGradient>
            <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
              Verify Your Account
            </Text>
            <Text style={[styles.subtitle, isSmallScreen && styles.subtitleSmall]}>
              Enter the 6-digit code sent to
            </Text>
            <Text style={styles.email}>{email}</Text>
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="warning" size={16} color={colors.red700} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Verification Code</Text>
            <View style={styles.otpContainer}>
              <TextInput
                ref={inputRef}
                style={styles.otpInput}
                placeholder="Enter 6-digit code"
                placeholderTextColor={colors.gray700}
                keyboardType="numeric"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                secureTextEntry={!showOtp}
                autoFocus={true}
              />
              <TouchableOpacity
                onPress={() => setShowOtp(!showOtp)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showOtp ? "eye-off" : "eye"}
                  size={24}
                  color={colors.purpleEnd}
                />
              </TouchableOpacity>
            </View>

            <GradientButton
              title={loading ? "Verifying..." : "Verify Account"}
              onPress={handleVerify}
              disabled={loading || otp.length < 6}
            />

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the code?
              </Text>
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={resendCountdown > 0 || resendLoading}
              >
                {resendLoading ? (
                  <ActivityIndicator size="small" color={colors.purpleStart} />
                ) : (
                  <Text style={[
                    styles.resendLink, 
                    resendCountdown > 0 && styles.resendLinkDisabled
                  ]}>
                    Resend {resendCountdown > 0 ? `(${resendCountdown}s)` : ""}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={16} color={colors.purpleStart} />
            <Text style={styles.backText}>Back to registration</Text>
          </TouchableOpacity>
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
      style={[styles.buttonWrapper, disabled && { opacity: 0.6 }]}
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
    flex: 1, 
    backgroundColor: colors.gray100,
  },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: spacing.md,
  },
  card: {
    width: "100%",
    maxWidth: 448,
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: radii["3xl"],
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 8,
  },
  cardSmall: {
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes.h2,
    fontWeight: "700",
    textAlign: "center",
    color: colors.black,
    marginBottom: spacing.xs,
  },
  titleSmall: {
    fontSize: fontSizes.h2,
  },
  subtitle: {
    fontSize: fontSizes.base,
    textAlign: "center",
    color: colors.gray700,
    marginBottom: spacing.xs,
  },
  subtitleSmall: {
    fontSize: fontSizes.sm,
  },
  email: {
    fontSize: fontSizes.base,
    fontWeight: "600",
    color: colors.purpleStart,
    textAlign: "center",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.red50,
    padding: spacing.sm,
    borderRadius: radii.sm,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.red700,
    marginLeft: spacing.xs,
    fontSize: fontSizes.sm,
  },
  formContainer: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    color: colors.black,
    marginBottom: spacing.xs,
    fontWeight: "600",
  },
  otpContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray100,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
  },
  otpInput: {
    flex: 1,
    padding: spacing.sm,
    fontSize: fontSizes.base,
    color: colors.black,
    fontWeight: "600",
  },
  eyeIcon: {
    padding: spacing.sm,
  },
  buttonWrapper: {
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  buttonTouchable: {
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  buttonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: fontSizes.base,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
  },
  resendText: {
    color: colors.gray700,
    fontSize: fontSizes.sm,
    marginRight: spacing.xs,
  },
  resendLink: {
    color: colors.purpleStart,
    fontWeight: "600",
    fontSize: fontSizes.sm,
  },
  resendLinkDisabled: {
    color: colors.gray700,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: colors.purpleStart,
    fontSize: fontSizes.sm,
    marginLeft: spacing.xs,
  },
});