import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Dimensions, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const { colors } = useTheme();
  const [reports, setReports] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'verified' | 'flagged'>('all');

  // Mock data
  useEffect(() => {
    const mockReports = Array.from({ length: 15 }, (_, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      fileName: `content_${i + 1}.jpg`,
      authenticityScore: Math.random() * 0.4 + 0.6, // 60-100%
      isAI: Math.random() > 0.7, // 30% chance of AI
      isTampered: Math.random() > 0.8, // 20% chance of tampering
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      contentHash: '0x' + Math.random().toString(16).substr(2, 64),
      status: Math.random() > 0.1 ? 'verified' : 'flagged'
    }));

    setReports(mockReports);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return '#10b981'; // green
    if (score >= 0.6) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getConfidenceText = (score: number) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'verified') return report.status === 'verified';
    if (filter === 'flagged') return report.status === 'flagged';
    return true;
  });

  const renderReportItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.listItem, { backgroundColor: colors.card }]}
      onPress={() => Alert.alert('Report Details', `File: ${item.fileName}\nAuthenticity Score: ${(item.authenticityScore * 100).toFixed(1)}%\nContent Hash: ${item.contentHash}`)}
    >
      <View style={styles.itemHeader}>
        <Ionicons 
          name={item.status === 'verified' ? "shield-checkmark" : "alert"} 
          size={24} 
          color={item.status === 'verified' ? '#10b981' : '#ef4444'} 
        />
        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1} ellipsizeMode="middle">
          {item.fileName}
        </Text>
        <View style={[
          styles.statusBadge,
          { 
            backgroundColor: item.status === 'verified' ? '#10b98120' : '#ef444420',
            borderColor: item.status === 'verified' ? '#10b981' : '#ef4444'
          }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'verified' ? '#10b981' : '#ef4444' }
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.scoreContainer}>
        <Text style={[styles.scoreLabel, { color: colors.text }]}>Authenticity Score:</Text>
        <View style={styles.scoreBar}>
          <View 
            style={[
              styles.scoreFill,
              { 
                width: `${item.authenticityScore * 100}%`,
                backgroundColor: getConfidenceColor(item.authenticityScore)
              }
            ]} 
          />
        </View>
        <Text style={[
          styles.scoreText,
          { color: getConfidenceColor(item.authenticityScore) }
        ]}>
          {(item.authenticityScore * 100).toFixed(1)}% ({getConfidenceText(item.authenticityScore)})
        </Text>
      </View>
      
      <View style={styles.indicators}>
        <View style={styles.indicator}>
          <Ionicons 
            name={item.isAI ? "alert-circle" : "checkmark-circle"} 
            size={16} 
            color={item.isAI ? "#ef4444" : "#10b981"} 
          />
          <Text style={[styles.indicatorText, { color: colors.text }]}>
            {item.isAI ? "AI Generated" : "Human Created"}
          </Text>
        </View>
        <View style={styles.indicator}>
          <Ionicons 
            name={item.isTampered ? "alert-circle" : "checkmark-circle"} 
            size={16} 
            color={item.isTampered ? "#ef4444" : "#10b981"} 
          />
          <Text style={[styles.indicatorText, { color: colors.text }]}>
            {item.isTampered ? "Tampered" : "Original"}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.timestamp, { color: colors.text }]}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Verification Reports</Text>
        <Text style={[styles.headerSubtitle, { color: colors.text }]}>View your content verification history</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="document-text" size={32} color="#3b82f6" />
          <Text style={[styles.statNumber, { color: colors.text }]}>15</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Total Reports</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="shield-checkmark" size={32} color="#10b981" />
          <Text style={[styles.statNumber, { color: colors.text }]}>12</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Verified</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="alert" size={32} color="#ef4444" />
          <Text style={[styles.statNumber, { color: colors.text }]}>3</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Flagged</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.activeFilter
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterText,
            filter === 'all' && styles.activeFilterText
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'verified' && styles.activeFilter
          ]}
          onPress={() => setFilter('verified')}
        >
          <Text style={[
            styles.filterText,
            filter === 'verified' && styles.activeFilterText
          ]}>
            Verified
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'flagged' && styles.activeFilter
          ]}
          onPress={() => setFilter('flagged')}
        >
          <Text style={[
            styles.filterText,
            filter === 'flagged' && styles.activeFilterText
          ]}>
            Flagged
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reports List */}
      <FlatList
        data={filteredReports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Action Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: colors.primary }]}
        onPress={() => Alert.alert('New Verification', 'Would you like to verify new content?')}
      >
        <Ionicons name="scan" size={24} color="white" />
      </TouchableOpacity>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: 16,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilter: {
    backgroundColor: '#e5e7eb',
  },
  filterText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  activeFilterText: {
    color: '#3b82f6',
  },
  list: {
    flex: 1,
  },
  listItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  scoreContainer: {
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  scoreFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorText: {
    fontSize: 12,
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
