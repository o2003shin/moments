import { ActivityIndicator, Alert, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';
import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Directory, Paths, File } from 'expo-file-system';
import { router, useFocusEffect } from 'expo-router';

interface Data {
  dirUri: string,
  latitude: number | null,
  longitude: number | null
}

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [pinData, setPinData] = useState<Data[] | null>(null);
  const colorScheme = useColorScheme();

  // Request location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission Denied', 'Please enable location access.');
        return;
      }
      let loc = await Location.getCurrentPositionAsync();
      setLocation(loc);
    })();
  }, []);

  // Load moments
  useFocusEffect(useCallback(() => {
    getMoments();
  }, []));

  const getMoments = () => {
    try {
      const momentsPath = `${Paths.document.uri}/moments`;
      const momentsFolders = new Directory(momentsPath).list();
      const momentsDirUris = momentsFolders.map(f => f['uri']);
      const entries: Data[] = [];

      for (let dirUri of momentsDirUris) {
        let data: Data = { dirUri, latitude: null, longitude: null };
        const group = new Directory(dirUri).list();

        for (let file of group) {
          const uri = file['uri'];
          if (uri.endsWith('moment.json')) {
            const f = new File(uri);
            const text = f.textSync();
            const metadata = JSON.parse(text);
            data.latitude = metadata.latitude;
            data.longitude = metadata.longitude;
          }
        }
        entries.push(data);
      }

      setPinData(entries);
    } catch (e) {
      console.error('Error loading moments:', e);
    }
  }

  // Calculate map region to fit all pins + user
  const getMapRegion = (): Region | null => {
    if (!location && (!pinData || pinData.length === 0)) return null;

    const allCoords = [
      ...(pinData || []).filter(p => p.latitude && p.longitude).map(p => ({ latitude: p.latitude!, longitude: p.longitude! })),
      ...(location ? [{ latitude: location.coords.latitude, longitude: location.coords.longitude }] : [])
    ];

    const latitudes = allCoords.map(c => c.latitude);
    const longitudes = allCoords.map(c => c.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;

    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: (maxLat - minLat) * 1.3 || 0.05,
      longitudeDelta: (maxLng - minLng) * 1.3 || 0.05
    };
  };

  // Loading state
  if (!location || !pinData) {
    return (
      <View style={[style.loadingContainer, { backgroundColor: colorScheme === 'dark' ? '#111' : '#fff' }]}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#000'} />
        <Text style={[style.loadingText, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>Loading map data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[style.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#f9f9f9' }]}>
      <View style={[style.header, { backgroundColor: colorScheme === 'dark' ? '#222' : '#fff' }]}>
        <Text style={[style.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Moments</Text>
      </View>

      <View style={style.mapContainer}>
        <MapView
          style={style.map}
          region={getMapRegion() ?? undefined}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            }}
            title="You are here"
          />
          {pinData.map(pin => (
            <Marker
              key={pin.dirUri}
              coordinate={{ latitude: pin.latitude ?? 0, longitude: pin.longitude ?? 0 }}
              pinColor={colorScheme === 'dark' ? '#4caf50' : 'green'}
              onPress={() => {
                router.push({
                  pathname: '/(modals)/detailedView',
                  params: { momentDir: pin.dirUri }
                });
              }}
            />
          ))}
        </MapView>
      </View>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  title: {
    fontSize: 28,
    fontWeight: '600'
  },
  mapContainer: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  map: {
    width: '100%',
    height: '100%'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center'
  }
});
