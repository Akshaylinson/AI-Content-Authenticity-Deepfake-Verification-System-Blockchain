import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Dimensions, ScrollView, RefreshControl, TextInput } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function BlockchainScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'blocks' | 'transactions'>('blocks');
  const [blocks, setBlocks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  useEffect(() => {
    // Generate mock blocks
    const mockBlocks = Array.from({ length: 20 }, (_, i) => ({
      id: (18723456 - i).toString(),
      number: 18723456 - i,
      hash: '0x' + Math.random().toString(16).substr(2, 64),
      timestamp: new Date(Date.now() - i * 12000).toISOString(),
      transactions: Math.floor(Math.random() * 15) + 5,
      size: Math.floor(Math.random() * 100000) + 50000,
      miner: '0x' + Math.random().toString(16).substr(2, 40),
      difficulty: Math.floor(Math.random() * 10000000000000000) + 10000000000000000
    }));

    // Generate mock transactions
    const mockTransactions = Array.from({ length: 50 }, (_, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      hash: '0x' + Math.random().toString(16).substr(2, 64),
      from: '0x' + Math.random().toString(16).substr(2, 40),
      to: '0x' + Math.random().toString(16).substr(2, 40),
      value: (Math.random() * 0.1).toFixed(6),
      gasPrice: Math.floor(Math.random() * 100) + 10,
      gasUsed: Math.floor(Math.random() * 50000) + 21000,
      blockNumber: 18723456 - Math.floor(i / 3),
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
      status: Math.random() > 0.1 ? 'success' : 'failed'
    }));

    setBlocks(mockBlocks);
    setTransactions(mockTransactions);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const formatAddress = (address: string) => {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  };

  const renderBlockItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.listItem, { backgroundColor: colors.card }]}
      onPress={() => Alert.alert('Block Details', `Block: ${item.number}\nHash: ${item.hash}`)}
    >
      <View style={styles.itemHeader}>
        <Ionicons name="cube" size={24} color="#3b82f6" />
        <Text style={[styles.itemTitle, { color: colors.text }]}>#{item.number}</Text>
        <View style={styles.itemStatus}>
          <Text style={[styles.statusText, { color: '#10b981' }]}>✓</Text>
        </View>
      </View>
      <View style={styles.itemDetails}>
        <Text style={[styles.detailText, { color: colors.text }]}>Tx: {item.transactions}</Text>
        <Text style={[styles.detailText, { color: colors.text }]}>Size: {(item.size / 1024).toFixed(1)} KB</Text>
        <Text style={[styles.detailText, { color: colors.text }]}>Miner: {formatAddress(item.miner)}</Text>
      </View>
      <Text style={[styles.timestamp, { color: colors.text }]}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  const renderTransactionItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.listItem, { backgroundColor: colors.card }]}
      onPress={() => Alert.alert('Transaction Details', `Hash: ${item.hash}\nFrom: ${item.from}\nTo: ${item.to}`)}
    >
      <View style={styles.itemHeader}>
        <Ionicons name="swap-horizontal" size={24} color={item.status === 'success' ? '#10b981' : '#ef4444'} />
        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1} ellipsizeMode="middle">
          {item.hash.substring(0, 16)}...
        </Text>
        <View style={styles.itemStatus}>
          <Text style={[styles.statusText, { color: item.status === 'success' ? '#10b981' : '#ef4444' }]}>
            {item.status === 'success' ? '✓' : '✗'}
          </Text>
        </View>
      </View>
      <View style={styles.itemDetails}>
        <Text style={[styles.detailText, { color: colors.text }]}>From: {formatAddress(item.from)}</Text>
        <Text style={[styles.detailText, { color: colors.text }]}>To: {formatAddress(item.to)}</Text>
        <Text style={[styles.detailText, { color: colors.text }]}>Value: {item.value} ETH</Text>
      </View>
      <Text style={[styles.timestamp, { color: colors.text }]}>
        Block #{item.blockNumber} • {new Date(item.timestamp).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  const filteredBlocks = blocks.filter(block =>
    block.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    block.number.toString().includes(searchQuery)
  );

  const filteredTransactions = transactions.filter(tx =>
    tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.to.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Blockchain Explorer</Text>
        <Text style={[styles.headerSubtitle, { color: colors.text }]}>Monitor content registrations</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="cube" size={32} color="#3b82f6" />
          <Text style={[styles.statNumber, { color: colors.text }]}>18,723,456</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Total Blocks</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="swap-horizontal" size={32} color="#10b981" />
          <Text style={[styles.statNumber, { color: colors.text }]}>2,847,392</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Transactions</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="document-text" size={32} color="#8b5cf6" />
          <Text style={[styles.statNumber, { color: colors.text }]}>1,247</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Content Reg.</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text }]}
          placeholder="Search blocks, transactions, hashes..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'blocks' && styles.activeTab
          ]}
          onPress={() => setActiveTab('blocks')}
        >
          <Ionicons 
            name="cube" 
            size={20} 
            color={activeTab === 'blocks' ? colors.primary : '#9CA3AF'} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'blocks' ? colors.primary : '#9CA3AF' }
          ]}>
            Blocks
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'transactions' && styles.activeTab
          ]}
          onPress={() => setActiveTab('transactions')}
        >
          <Ionicons 
            name="swap-horizontal" 
            size={20} 
            color={activeTab === 'transactions' ? colors.primary : '#9CA3AF'} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'transactions' ? colors.primary : '#9CA3AF' }
          ]}>
            Transactions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'blocks' ? (
        <FlatList
          data={filteredBlocks}
          renderItem={renderBlockItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Action Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: colors.primary }]}
        onPress={() => Alert.alert('Register Content', 'Would you like to register content on the blockchain?')}
      >
        <Ionicons name="add" size={24} color="white" />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#e5e7eb',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
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
    marginBottom: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  itemStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontWeight: 'bold',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
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






