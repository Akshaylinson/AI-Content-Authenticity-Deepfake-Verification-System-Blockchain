import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Dimensions, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'react-native-image-picker';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function VerificationScreen() {
  const { colors } = useTheme();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  
  const cameraRef = useRef<any>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = {
        quality: 0.8,
        base64: true,
        exif: false,
      };
      
      try {
        const photo = await cameraRef.current.takePictureAsync(options);
        setSelectedImage(photo.uri);
        setCameraVisible(false);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Could not take picture. Please try again.');
      }
    }
  };

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

  const startVerification = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image to verify first.');
      return;
    }

    setIsVerifying(true);
    setVerificationProgress(0);
    
    // Simulate verification process
    const interval = setInterval(() => {
      setVerificationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate API call to verification service
    setTimeout(() => {
      clearInterval(interval);
      setVerificationResult({
        authenticityScore: Math.random() * 0.4 + 0.6, // 60-100%
        isAI: Math.random() > 0.7, // 30% chance of AI
        isTampered: Math.random() > 0.8, // 20% chance of tampering
        blockchainRegistered: Math.random() > 0.6, // 40% chance of registration
        signals: [
          { name: 'Frequency Analysis', score: Math.random(), confidence: Math.random() > 0.5 ? 'high' : 'medium' },
          { name: 'Noise Pattern', score: Math.random(), confidence: Math.random() > 0.5 ? 'high' : 'medium' },
          { name: 'Metadata Consistency', score: Math.random(), confidence: Math.random() > 0.5 ? 'high' : 'medium' },
          { name: 'Compression Artifacts', score: Math.random(), confidence: Math.random() > 0.5 ? 'high' : 'medium' },
        ],
        timestamp: new Date().toISOString(),
        contentHash: '0x' + Math.random().toString(16).substr(2, 64)
      });
      setIsVerifying(false);
    }, 3000);
  };

  const resetVerification = () => {
    setSelectedImage(null);
    setVerificationResult(null);
    setVerificationProgress(0);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return '#10b981'; // green
    if (score >= 0.6) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getConfidenceText = (score: number) => {
    if (score >= 0.8) return 'High Confidence';
    if (score >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Content Verification</Text>
        <Text style={[styles.headerSubtitle, { color: colors.text }]}>Scan content for authenticity</Text>
      </View>

      {/* Image Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Image</Text>
        
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

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.cameraButton]} 
            onPress={() => setCameraVisible(true)}
          >
            <Ionicons name="camera" size={24} color="white" />
            <Text style={styles.buttonText}>Camera</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.galleryButton]} 
            onPress={pickImage}
          >
            <Ionicons name="images" size={24} color="white" />
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Verification Result */}
      {selectedImage && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Verification</Text>
          
          {isVerifying ? (
            <View style={styles.verificationProgress}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.progressText, { color: colors.text }]}>Analyzing content...</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${verificationProgress}%`,
                      backgroundColor: colors.primary
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressPercent, { color: colors.text }]}>{verificationProgress}%</Text>
            </View>
          ) : verificationResult ? (
            <View style={styles.resultContainer}>
              <View style={[styles.resultHeader, { backgroundColor: colors.card }]}>
                <Text style={[styles.resultTitle, { color: colors.text }]}>Verification Result</Text>
                <View style={[
                  styles.confidenceBadge, 
                  { 
                    backgroundColor: `${getConfidenceColor(verificationResult.authenticityScore)}20`,
                    borderColor: getConfidenceColor(verificationResult.authenticityScore)
                  }
                ]}>
                  <Text style={[
                    styles.confidenceText,
                    { color: getConfidenceColor(verificationResult.authenticityScore) }
                  ]}>
                    {getConfidenceText(verificationResult.authenticityScore)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.resultStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.text }]}>Authenticity Score</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>{(verificationResult.authenticityScore * 100).toFixed(1)}%</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.text }]}>AI Generated</Text>
                  <Text style={[
                    styles.statValue,
                    { color: verificationResult.isAI ? '#ef4444' : '#10b981' }
                  ]}>
                    {verificationResult.isAI ? 'Yes' : 'No'}
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.text }]}>Tampered</Text>
                  <Text style={[
                    styles.statValue,
                    { color: verificationResult.isTampered ? '#ef4444' : '#10b981' }
                  ]}>
                    {verificationResult.isTampered ? 'Yes' : 'No'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.signalsSection}>
                <Text style={[styles.signalsTitle, { color: colors.text }]}>Detection Signals</Text>
                {verificationResult.signals.map((signal: any, index: number) => (
                  <View key={index} style={styles.signalItem}>
                    <View style={styles.signalHeader}>
                      <Text style={[styles.signalName, { color: colors.text }]}>{signal.name}</Text>
                      <Text style={[styles.signalScore, { color: colors.text }]}>{(signal.score * 100).toFixed(0)}%</Text>
                    </View>
                    <View style={styles.signalBar}>
                      <View 
                        style={[
                          styles.signalFill,
                          { 
                            width: `${signal.score * 100}%`,
                            backgroundColor: signal.confidence === 'high' ? '#10b981' : '#f59e0b'
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[
                      styles.confidenceLevel,
                      { color: signal.confidence === 'high' ? '#10b981' : '#f59e0b' }
                    ]}>
                      {signal.confidence} confidence
                    </Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity 
                style={[styles.button, styles.verifyButton]} 
                onPress={resetVerification}
              >
                <Ionicons name="refresh" size={24} color="white" />
                <Text style={styles.buttonText}>New Verification</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.button, styles.verifyButton]} 
              onPress={startVerification}
            >
              <Ionicons name="scan" size={24} color="white" />
              <Text style={styles.buttonText}>Verify Content</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Camera Modal */}
      <Modal
        visible={cameraVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.cameraModal}>
          <View style={styles.cameraContainer}>
            {hasCameraPermission === null ? (
              <Text style={styles.cameraText}>Requesting camera permission...</Text>
            ) : hasCameraPermission === false ? (
              <Text style={styles.cameraText}>Camera access denied</Text>
            ) : (
              <Camera
                style={styles.camera}
                ref={cameraRef}
                ratio="16:9"
              />
            )}
            
            <View style={styles.cameraControls}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setCameraVisible(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.captureButton}
                onPress={takePicture}
              >
                <Ionicons name="radio-button-on" size={48} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  cameraButton: {
    backgroundColor: '#3b82f6',
  },
  galleryButton: {
    backgroundColor: '#8b5cf6',
  },
  verifyButton: {
    backgroundColor: '#10b981',
    alignSelf: 'center',
    minWidth: width * 0.6,
  },
  buttonText: {
    color: 'white',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  confidenceText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  resultStats: {
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statLabel: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  signalsSection: {
    marginBottom: 16,
  },
  signalsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  signalItem: {
    marginBottom: 12,
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  signalName: {
    fontSize: 14,
  },
  signalScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  signalBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  signalFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceLevel: {
    fontSize: 12,
    textAlign: 'right',
  },
  cameraModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 50,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
