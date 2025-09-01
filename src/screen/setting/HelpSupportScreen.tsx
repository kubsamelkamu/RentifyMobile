import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HelpSupportScreen = () => {
  
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  
  const faqData = [
    {
      question: 'How do I rent a property?',
      answer: "Browse listings, select a property, and click 'Rent Now'. You'll be guided through booking and payment.",
    },
    {
      question: 'How do I list my property?',
      answer: "Click 'List Property', fill out the form, and your listing will go live instantly.",
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We support Telebirr and bank transfers via Chapa Payment gateway.',
    },
    {
      question: 'How can I chat with landlords?',
      answer: "On a property page, click the 'Chat with owner' button.",
    },
    {
      question: 'How can I contact support?',
      answer: 'Reach us via email at support@rentify.et',
    },
  ];

  const toggleQuestion = (index: number) => {
    if (expandedQuestion === index) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(index);
    }
  };

  const contactSupport = () => {
    Linking.openURL('mailto:support@rentify.et');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>We're here to help you with any questions or issues</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqData.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity 
                style={styles.faqQuestion}
                onPress={() => toggleQuestion(index)}
              >
                <Text style={styles.faqText}>{item.question}</Text>
                <Ionicons 
                  name={expandedQuestion === index ? "chevron-down" : "chevron-forward"} 
                  size={20} 
                  color="#3B82F6" 
                />
              </TouchableOpacity>
              {expandedQuestion === index && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Options</Text>
          <TouchableOpacity style={styles.linkItem} onPress={contactSupport}>
            <Ionicons name="mail-outline" size={24} color="#3B82F6" />
            <Text style={styles.linkText}>Email Support: support@rentify.et</Text>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>Version 1.0.0</Text>
            <Text style={styles.infoLabel}>Latest version</Text>
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
  faqItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  faqText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    fontWeight: '500',
  },
  faqAnswer: {
    paddingVertical: 12,
    paddingLeft: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  answerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
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
  infoContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default HelpSupportScreen;