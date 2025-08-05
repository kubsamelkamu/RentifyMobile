import {View,Text,StyleSheet,ScrollView,TouchableOpacity} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList }    from '../../navigation/AuthNavigator';
import { colors, spacing, radii, fontSizes } from '../../style/shared/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyEmailInfo'>;

export default function VerifyEmailInfoScreen({ navigation }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.message}>
          We&apos;ll send a verification link to your email address. Please check your inbox and click the link to verify your account.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.gray100,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 448,
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: radii.xl,     
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.h2,     
    fontWeight: '700',
    color: colors.purpleStart,  
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    fontSize: fontSizes.base,  
    color: colors.gray700,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.purpleStart,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,    
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.base,
    fontWeight: '600',
  },
});
