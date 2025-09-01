import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AboutScreen = () => {
  
  const visitWebsite = () => {
    Linking.openURL('https://rentify-liard-mu.vercel.app/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>About Rentify</Text>
          <Text style={styles.subtitle}>AI-Powered Property Rental Platform</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Story</Text>
          <Text style={styles.paragraph}>
            Rentify was founded in 2025 with a vision to transform the property rental experience in Ethiopia. 
            We recognized the challenges both tenants and landlords face in finding and managing rental properties, 
            and set out to create a solution that makes the process seamless, transparent, and efficient.
          </Text>
          <Text style={styles.paragraph}>
            Our cross-platform application leverages artificial intelligence to match tenants with their ideal 
            properties and helps landlords find qualified renters quickly. By combining cutting-edge technology 
            with deep market understanding, we're creating Ethiopia's most advanced rental platform.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Technology</Text>
          <Text style={styles.paragraph}>
            Rentify uses AI algorithms to analyze user preferences and property features, providing personalized 
            recommendations that save time and improve matches. Our real-time chat system enables instant 
            communication between tenants and landlords, while our secure payment processing through Telebirr 
            and Chapa ensures safe transactions.
          </Text>
          <Text style={styles.paragraph}>
            As a cross-platform application, Rentify works seamlessly across iOS, Android, and web platforms, 
            ensuring you can manage your rental needs anywhere, anytime.
          </Text>
        </View>
  
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Team</Text>
          <Text style={styles.paragraph}>
            We're a diverse team of Ethiopian developers, data scientists, and real estate experts passionate 
            about solving local housing challenges through innovation. Our team combines technical expertise 
            with deep market knowledge to create solutions that truly meet the needs of Ethiopian renters and 
            property owners.
          </Text>
          <Text style={styles.paragraph}>
            With backgrounds in software engineering, AI research, and property management, we're uniquely 
            positioned to build the future of rental services in Ethiopia.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect With Us</Text>
          <TouchableOpacity style={styles.linkItem} onPress={visitWebsite}>
            <Ionicons name="globe-outline" size={24} color="#3B82F6" />
            <Text style={styles.linkText}>Visit our website</Text>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Version</Text>
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>1.0.0</Text>
            <Text style={styles.versionLabel}>Latest version</Text>
          </View>
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
  subtitle: {
    fontSize: 16,
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
    marginBottom: 16,
    textAlign: 'justify',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
  },
  versionLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default AboutScreen;