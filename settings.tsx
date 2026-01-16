import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const { colors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoVerify, setAutoVerify] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);

  const settingItems = [
    {
      id: 'account',
      title: 'Account Settings',
      icon: 'person',
      items: [
        { id: 'profile', title: 'Edit Profile', subtitle: 'Update your profile information' },
        { id: 'security', title: 'Security', subtitle: 'Manage passwords and authentication' },
        { id: 'privacy', title: 'Privacy', subtitle: 'Configure privacy settings' },
      ]
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: 'options',
      items: [
        { 
          id: 'theme', 
          title: 'Dark Mode', 
          subtitle: 'Switch between light and dark themes',
          type: 'switch',
          value: darkMode,
          onToggle: setDarkMode
        },
        { 
          id: 'notifications', 
          title: 'Notifications', 
          subtitle: 'Enable or disable app notifications',
          type: 'switch',
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled
        },
        { 
          id: 'autoVerify', 
          title: 'Auto Verify', 
          subtitle: 'Automatically verify content upon upload',
          type: 'switch',
          value: autoVerify,
          onToggle: setAutoVerify
        },
        { 
          id: 'details', 
          title: 'Show Details', 
          subtitle: 'Display detailed analysis in reports',
          type: 'switch',
          value: showDetails,
          onToggle: setShowDetails
        },
        { 
          id: 'biometric', 
          title: 'Biometric Auth', 
          subtitle: 'Use fingerprint or face unlock',
          type: 'switch',
          value: biometricAuth,
          onToggle: setBiometricAuth
        },
      ]
    },
    {
      id: 'support',
      title: 'Support',
      icon: 'help-circle',
      items: [
        { id: 'faq', title: 'FAQ', subtitle: 'Frequently asked questions' },
        { id: 'contact', title: 'Contact Support', subtitle: 'Get help from our team' },
        { id: 'feedback', title: 'Send Feedback', subtitle: 'Share your thoughts with us' },
      ]
    },
    {
      id: 'about',
      title: 'About',
      icon: 'information-circle',
      items: [
        { id: 'terms', title: 'Terms of Service', subtitle: 'Legal terms and conditions' },
        { id: 'privacyPolicy', title: 'Privacy Policy', subtitle: 'How we handle your data' },
        { id: 'licenses', title: 'Open Source Licenses', subtitle: 'Third-party licenses' },
      ]
    }
  ];

  const handleSettingPress = (sectionId: string, itemId: string) => {
    if (sectionId === 'support' && itemId === 'contact') {
      Alert.alert('Contact Support', 'Would you like to contact support?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email', onPress: () => Alert.alert('Email', 'Sending email to support...') },
        { text: 'Chat', onPress: () => Alert.alert('Chat', 'Opening chat with support...') },
      ]);
    } else if (sectionId === 'about' && itemId === 'terms') {
      Alert.alert('Terms of Service', 'Viewing terms of service...');
    } else if (sectionId === 'account' && itemId === 'profile') {
      Alert.alert('Edit Profile', 'Opening profile editor...');
    } else {
      Alert.alert(itemId, `Opening ${itemId} settings`);
    }
  };

  const renderSettingItem = (item: any) => {
    if (item.type === 'switch') {
      return (
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => item.onToggle(!item.value)}
        >
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.settingSubtitle, { color: colors.text + '80' }]}>{item.subtitle}</Text>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={item.value ? 'white' : '#f4f3f4'}
          />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.settingRow}
        onPress={() => handleSettingPress(item.sectionId, item.id)}
      >
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.settingSubtitle, { color: colors.text + '80' }]}>{item.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text + '50'} />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.headerSubtitle, { color: colors.text }]}>Manage your app preferences</Text>
      </View>

      {settingItems.map((section) => (
        <View key={section.id} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name={section.icon as any} size={20} color={colors.text} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
          </View>
          
          {section.items.map((item) => (
            <View key={item.id} style={styles.settingItem}>
              {renderSettingItem({...item, sectionId: section.id})}
            </View>
          ))}
        </View>
      ))}

      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: colors.text + '80' }]}>AuthentiScan Mobile v2.0.0</Text>
        <Text style={[styles.versionText, { color: colors.text + '80' }]}>AI Content Authenticity Verifier</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  settingItem: {
    marginBottom: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
  },
});
