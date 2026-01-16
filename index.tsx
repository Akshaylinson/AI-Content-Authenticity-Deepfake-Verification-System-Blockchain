import { Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors } = useTheme();
  
  const handleVerification = () => {
    Alert.alert('Verification', 'Starting content verification process...');
  };
  
  const handleRegistration = () => {
    Alert.alert('Registration', 'Starting content registration process...');
  };
  
  const handleBlockchain = () => {
    Alert.alert('Blockchain', 'Accessing blockchain explorer...');
  };
  
  const handleReports = () => {
    Alert.alert('Reports', 'Viewing verification reports...');
  };
  
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#1e40af', dark: '#1e3a8a' }}
      headerImage={
        <Image
          source={require('@/assets/images/icon.png')}
          style={[styles.reactLogo, styles.headerImage]}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">AuthentiScan Mobile</ThemedText>
        <ThemedText type="subtitle">AI Content Authenticity Verification</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="shield-checkmark" size={24} color="#10b981" />
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>1,247</ThemedText>
          <ThemedText type="default">Verifications</ThemedText>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>98.7%</ThemedText>
          <ThemedText type="default">Accuracy</ThemedText>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="document-text" size={24} color="#8b5cf6" />
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>156</ThemedText>
          <ThemedText type="default">Reports</ThemedText>
        </View>
      </ThemedView>
      
      <ThemedView style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleVerification}>
            <LinearGradient
              colors={['#3b82f6', '#1d4ed8']}
              style={styles.gradientButton}
            >
              <Ionicons name="scan" size={24} color="white" />
              <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>Verify Content</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleRegistration}>
            <LinearGradient
              colors={['#10b981', '#047857']}
              style={styles.gradientButton}
            >
              <Ionicons name="cloud-upload" size={24} color="white" />
              <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>Register</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleBlockchain}>
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              style={styles.gradientButton}
            >
              <Ionicons name="logo-bitcoin" size={24} color="white" />
              <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>Blockchain</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleReports}>
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.gradientButton}
            >
              <Ionicons name="document" size={24} color="white" />
              <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>Reports</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ThemedView>
      
      <ThemedView style={styles.infoSection}>
        <Ionicons name="information-circle" size={24} color="#3b82f6" />
        <ThemedText type="defaultSemiBold" style={styles.infoTitle}>About AuthentiScan</ThemedText>
        <ThemedText type="default" style={styles.infoText}>
          Verify the authenticity of AI-generated content and register original creations on the blockchain.
          Our advanced algorithms detect tampering, synthetic generation, and provide verifiable proof of origin.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statCard: {
    alignItems: 'center',
    padding: 12,
    minWidth: (width - 48) / 3,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  quickActionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  gradientButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionButtonText: {
    color: 'white',
    marginTop: 8,
    textAlign: 'center',
  },
  infoSection: {
    padding: 16,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 16,
    marginVertical: 8,
  },
  infoText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  headerImage: {
    height: 100,
    width: 100,
    alignSelf: 'center',
    borderRadius: 50,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
