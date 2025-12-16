// app/(tabs)/_layout.tsx
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: 90,
          paddingTop: 9
        },
        tabBarLabelStyle: {
          height: 0
        }
      }}
      screenListeners={{
        tabPress: (e) => {
          // Intercept the camera tab press
          if (e.target?.includes('camera-button')) {
            e.preventDefault();
            router.push('/(modals)/camera');
          }
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <MaterialIcons size={32} name='map' color={color} />,
        }}
      />
      <Tabs.Screen
        name="camera-button"
        options={{
          title: '',
          tabBarLabel: () => null,
          tabBarIcon: ({ color }) => <MaterialIcons size={32} name='add-circle' color={color} style={{ marginTop: -2 }} />,
        }}
      />
      <Tabs.Screen
        name='gallery'
        options={{
          title: '',
          tabBarIcon: ({ color }) => <MaterialIcons size={32} name='photo-library' color={color} />,
        }}
      />
    </Tabs>
  );
}