import { Image, StyleSheet, Text, View, ScrollView, FlatList } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function TabTwoScreen() {
  const { colors } = useTheme();
  
  const features = [
    {
      id: '1',
      title: 'AI Generation Detection',
      description: 'Advanced algorithms to detect AI-generated content using frequency analysis and pattern recognition.',
      icon: 'eye',
    },
    {
      id: '2',
      title: 'Blockchain Registration',
      description: 'Secure registration of original content on blockchain networks for verifiable proof of creation.',
      icon: 'logo-bitcoin',
    },
    {
      id: '3',
      title: 'Tamper Detection',
      description: 'Identify signs of digital manipulation and tampering in images and videos.',
      icon: 'alert',
    },
    {
      id: '4',
      title: 'Verification Reports',
      description: 'Comprehensive reports with confidence scores and detailed technical analysis.',
      icon: 'document',
    },
    {
      id: '5',
      title: 'Real-time Analysis',
      description: 'Instant content verification with detailed authenticity scoring.',
      icon: 'flash',
    },
    {
      id: '6',
      title: 'Secure Storage',
      description: 'Encrypted content storage with secure handling of sensitive materials.',
      icon: 'lock-closed',
    },
  ];
  
  const recentActivities = [
    { id: '1', title: 'Image verified', time: '2 min ago', type: 'verification', status: 'success' },
    { id: '2', title: 'Content registered', time: '15 min ago', type: 'registration', status: 'success' },
    { id: '3', title: 'AI content detected', time: '1 hour ago', type: 'detection', status: 'warning' },
    { id: '4', title: 'Report generated', time: '2 hours ago', type: 'report', status: 'success' },
  ];
  
  const renderFeature = ({ item }: { item: any }) => (
    <ThemedView style={[styles.featureCard, { borderColor: colors.border }]}> 
      <Ionicons name={item.icon as any} size={32} color={colors.primary} />
      <ThemedText type="subtitle" style={styles.featureTitle}>{item.title}</ThemedText>
      <ThemedText type="default" style={styles.featureDescription}>{item.description}</ThemedText>
    </ThemedView>
  );
  
  const renderActivity = ({ item }: { item: any }) => (
    <ThemedView style={styles.activityItem}>
      <Ionicons 
        name={item.type === 'verification' ? 'scan' : 
             item.type === 'registration' ? 'cloud-upload' : 
             item.type === 'detection' ? 'alert-circle' : 'document'} 
        size={20} 
        color={item.status === 'success' ? '#10b981' : '#f59e0b'} 
      />
      <View style={styles.activityContent}>
        <ThemedText type="defaultSemiBold" style={styles.activityTitle}>{item.title}</ThemedText>
        <ThemedText type="default" style={styles.activityTime}>{item.time}</ThemedText>
      </View>
    </ThemedView>
  );
  
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<Image source={require('@/assets/images/icon.png')} style={styles.reactLogo} />}> 
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Features & Capabilities</ThemedText>
        <ThemedText type="subtitle">Explore the power of AI authenticity verification</ThemedText>
      </ThemedView>
      
      <Collapsible title="Core Verification Features">
        <FlatList
          data={features}
          renderItem={renderFeature}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.featuresGrid}
        />
      </Collapsible>
      
      <Collapsible title="Recent Activities">
        <FlatList
          data={recentActivities}
          renderItem={renderActivity}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </Collapsible>
      
      <Collapsible title="How It Works">
        <ThemedText style={styles.howItWorksText}>
          Our AI Content Authenticity Verification Platform combines advanced machine learning algorithms
          with blockchain technology to provide the most reliable content verification solution.
        </ThemedText>
        <ThemedText style={styles.howItWorksText}>
          1. Upload content for analysis
        </ThemedText>
        <ThemedText style={styles.howItWorksText}>
          2. Advanced algorithms analyze for AI generation and tampering
        </ThemedText>
        <ThemedText style={styles.howItWorksText}>
          3. Results are recorded on blockchain for verification
        </ThemedText>
        <ThemedText style={styles.howItWorksText}>
          4. Receive detailed report with confidence scores
        </ThemedText>
      </Collapsible>
      
      <Collapsible title="Technology Behind">
        <ThemedText style={styles.howItWorksText}>
          Our platform uses state-of-the-art detection methods including:
        </ThemedText>
        <ThemedText style={styles.howItWorksText}>
          • Frequency domain analysis
        </ThemedText>
        <ThemedText style={styles.howItWorksText}>
          • Noise pattern analysis
        </ThemedText>
        <ThemedText style={styles.howItWorksText}>
          • Compression artifact detection
        </ThemedText>
        <ThemedText style={styles.howItWorksText}>
          • Metadata consistency checks
        </ThemedText>
        <ThemedText style={styles.howItWorksText}>
          • Blockchain verification
        </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  featuresGrid: {
    justifyContent: 'space-between',
  },
  featureCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  featureTitle: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  featureDescription: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityContent: {
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 16,
  },
  activityTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  howItWorksText: {
    lineHeight: 20,
    marginVertical: 4,
  },
  reactLogo: {
    height: 100,
    width: 100,
    alignSelf: 'center',
    borderRadius: 50,
  },
});
