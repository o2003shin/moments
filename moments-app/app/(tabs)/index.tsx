import { Image } from 'expo-image';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';
import { CameraType, CameraView, FlashMode, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRef, useState } from 'react';

export default function HomeScreen() {

  return (
    <SafeAreaView style={{
      display: 'flex',
      justifyContent: 'center',
      flex: 1
    }}>
      <View style={{
      }}>
        <Text style={{ color: 'white', alignSelf: 'center' }}>Moments</Text>
      </View>
    </SafeAreaView>
  );
}