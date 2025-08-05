import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screen/auth/LoginScreen'
import RegisterScreen from '../screen/auth/RegisterScreen'
import ForgotPasswordScreen from '../screen/auth/ForgotPasswordScreen'
import VerifyEmailInfoScreen from '../screen/auth/VerifyEmailInfoScreen'

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  EmailVerify: { token: string };
  VerifyEmailInfo:undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen}/>
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyEmailInfo" component={VerifyEmailInfoScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
