import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="verification/index"
        options={{
          title: 'Verify',
          tabBarIcon: ({ color }) => <Ionicons name="scan" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="registration/index"
        options={{
          title: 'Register',
          tabBarIcon: ({ color }) => <Ionicons name="cloud-upload" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="blockchain/index"
        options={{
          title: 'Blockchain',
          tabBarIcon: ({ color }) => <Ionicons name="logo-bitcoin" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports/index"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }) => <Ionicons name="document-text" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons name="cog" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
