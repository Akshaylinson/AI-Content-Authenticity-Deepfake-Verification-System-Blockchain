import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Dimensions, ScrollView, TextInput, Modal, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function RegistrationScreen() {
  const { colors } = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [creatorName, setCreatorName] = useState('');
  const [creatorEmail, setCreatorEmail] = useState('');
  const [description, setDescription] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [registrationProgress, setRegistrationProgress] = useState(0);
  const [blockchainNetwork, setBlockchainNetwork] = useState('ethereum');
  
  const pickImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) {
        console.log('Image picker cancelled or error');
        return;
      }

      if (response.assets && response.assets[0].uri) {
        setSelectedImage(response.assets[0].uri);
      }
    });
  };

  const startRegistration = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image to register first.');
      return;
    }

    if (!creatorName.trim() || !creatorEmail.trim()) {
      Alert.alert('Missing Information', 'Please enter creator name and email.');
      return;
    }

    setIsRegistering(true);
    setRegistrationProgress(0);
    
    // Simulate registration process
    const interval = setInterval(() => {
      setRegistrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);

    // Simulate API call to registration service
    setTimeout(() => {
      clearInterval(interval);
      setRegistrationResult({
        contentHash: '0x' + Math.random().toString(16).substr(2, 64),
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        blockNumber: Math.floor(Math.random() * 1000000) + 1,
        timestamp: new Date().toISOString(),
        blockchain: blockchainNetwork,
        creator: creatorName,
        status: 'confirmed',
        fee: (Math.random() * 0.001 + 0.0001).toFixed(6)
      });
      setIsRegistering(false);
    }, 4000);
  };

  const resetRegistration = () => {
    setSelectedImage(null);
    setCreatorName('');
    setCreatorEmail('');
    setDescription('');
    setRegistrationResult(null);
    setRegistrationProgress(0);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Content Registration</Text>
        <Text style={[styles.headerSubtitle, { color: colors.text }]}>Register original content on blockchain</Text>
      </View>

      {!registrationResult ? (
        <>
          {/* Image Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Content</Text>
            
            <View style={styles.imageSelection}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              ) : (
                <View style={[styles.imagePlaceholder, { backgroundColor: colors.card }]}>
                  <Ionicons name="image-outline" size={48} color={colors.text} />
                  <Text style={[styles.placeholderText, { color: colors.text }]}>No image selected</Text>
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.button, styles.uploadButton]} 
              onPress={pickImage}
            >
              <Ionicons name="cloud-upload" size={24} color="white" />
              <Text style={styles.buttonText}>Select Image</Text>
            </TouchableOpacity>
          </View>

          {/* Creator Information */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Creator Information</Text>
            
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Creator Name"
              placeholderTextColor={colors.text + '80'}
              value={creatorName}
              onChangeText={setCreatorName}
            />
            
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Email Address"
              placeholderTextColor={colors.text + '80'}
              value={creatorEmail}
              onChangeText={setCreatorEmail}
              keyboardType="email-address"
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description (Optional)</Text>
            
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Describe the content (optional)"
              placeholderTextColor={colors.text + '80'}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Blockchain Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Blockchain Settings</Text>
            
            <View style={styles.optionRow}>
              <Text style={{ color: colors.text }}>Network:</Text>
              <View style={styles.pickerContainer}>
                {['ethereum', 'polygon', 'avalanche'].map(network => (
                  <TouchableOpacity
                    key={network}
                    style={[
                      styles.optionButton,
                      blockchainNetwork === network && styles.activeOption
                    ]}
                    onPress={() => setBlockchainNetwork(network)}
                  >
                    <Text style={[
                      styles.optionText,
                      blockchainNetwork === network && styles.activeOptionText
                    ]}>
                      {network.charAt(0).toUpperCase() + network.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.optionRow}>
              <Text style={{ color: colors.text }}>Privacy:</Text>
              <View style={styles.pickerContainer}>
                {['public', 'private', 'anonymous'].map(privacy => (
                  <TouchableOpacity
                    key={privacy}
                    style={[
                      styles.optionButton,
                      privacy === 'public' && styles.activeOption
                    ]}
                    onPress={() => {}}
                  >
                    <Text style={[
                      styles.optionText,
                      privacy === 'public' && styles.activeOptionText
                    ]}>
                      {privacy.charAt(0).toUpperCase() + privacy.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity 
            style={[styles.button, styles.registerButton]} 
            onPress={startRegistration}
          >
            <Ionicons name="cloud-upload" size={24} color="white" />
            <Text style={styles.buttonText}>Register on Blockchain</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Registration Result</Text>
          
          {isRegistering ? (
            <View style={styles.verificationProgress}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.progressText, { color: colors.text }]}>Registering on blockchain...</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${registrationProgress}%`,
                      backgroundColor: colors.primary
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressPercent, { color: colors.text }]}>{registrationProgress}%</Text>
            </View>
          ) : (
            <View style={styles.resultContainer}>
              <View style={[styles.resultHeader, { backgroundColor: colors.card }]}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                <Text style={[styles.resultTitle, { color: colors.text }]}>Successfully Registered</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Content Hash:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1} ellipsizeMode="middle">
                  {registrationResult.contentHash}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Transaction:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1} ellipsizeMode="middle">
                  {registrationResult.transactionHash}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Block Number:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  #{registrationResult.blockNumber}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Network:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {registrationResult.blockchain}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Creator:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {registrationResult.creator}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Fee:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {registrationResult.fee} ETH
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Status:</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Confirmed</Text>
                </View>
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.button, styles.secondaryButton]} 
                  onPress={() => Alert.alert('View Transaction', 'Opening transaction details...')}
                >
                  <Ionicons name="open-outline" size={24} color={colors.text} />
                  <Text style={[styles.buttonText, { color: colors.text }]}>View Tx</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.secondaryButton]} 
                  onPress={() => Alert.alert('Download Certificate', 'Downloading certificate...')}
                >
                  <Ionicons name="download" size={24} color={colors.text} />
                  <Text style={[styles.buttonText, { color: colors.text }]}>Certificate</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.resetButton]} 
                  onPress={resetRegistration}
                >
                  <Ionicons name="refresh" size={24} color="white" />
                  <Text style={styles.buttonText}>New</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  imageSelection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedImage: {
    width: width * 0.8,
    height: width * 0.6,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: width * 0.8,
    height: width * 0.6,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    padding: 4,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  activeOption: {
    backgroundColor: '#3b82f6',
  },
  optionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: width * 0.4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  uploadButton: {
    backgroundColor: '#3b82f6',
    alignSelf: 'center',
    minWidth: width * 0.6,
  },
  registerButton: {
    backgroundColor: '#10b981',
    alignSelf: 'center',
    minWidth: width * 0.8,
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    flex: 1,
    marginHorizontal: 4,
  },
  resetButton: {
    backgroundColor: '#8b5cf6',
    flex: 1,
    marginHorizontal: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  verificationProgress: {
    alignItems: 'center',
    padding: 24,
  },
  progressText: {
    fontSize: 16,
    marginVertical: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  resultContainer: {
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    textAlign: 'right',
    flex: 1.5,
  },
  statusBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
