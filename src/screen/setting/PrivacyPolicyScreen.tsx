import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';

const PrivacyPolicyScreen = () => {
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last updated: August 31, 2025</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect information you provide directly to us, such as when you create an account,
            update your profile, or use our services. This may include:
          </Text>
          <Text style={styles.bullet}>• Name, email address, and phone number</Text>
          <Text style={styles.bullet}>• Profile information and preferences</Text>
          <Text style={styles.bullet}>• Property search criteria and rental history</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to provide, maintain, and improve our services,
            including:
          </Text>
          <Text style={styles.bullet}>• Facilitating connections between tenants and landlords</Text>
          <Text style={styles.bullet}>• Personalizing your experience</Text>
          <Text style={styles.bullet}>• Communicating with you about products, services, and promotions</Text>
          <Text style={styles.bullet}>• Detecting and preventing fraud</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.paragraph}>
            We may share your information with:
          </Text>
          <Text style={styles.bullet}>• Landlords or tenants (as necessary for the rental process)</Text>
          <Text style={styles.bullet}>• Service providers who assist us in operating our services</Text>
          <Text style={styles.bullet}>• Legal authorities when required by law</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information to third parties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate security measures to protect your personal information
            from unauthorized access, alteration, or destruction. However, no method of transmission
            over the Internet or electronic storage is 100% secure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Your Choices</Text>
          <Text style={styles.paragraph}>
            You can update your account information and communication preferences at any time
            through your account settings. You may also request deletion of your account by
            contacting us.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any changes
            by posting the new policy on this page and updating the "Last updated" date.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={styles.contact}>srentify@gmail.com</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 8,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    paddingLeft: 12,
  },
  paragraph: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'justify',
  },
  bullet: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginLeft: 16,
    marginBottom: 4,
  },
  contact: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
    marginTop: 8,
  },
});

export default PrivacyPolicyScreen;