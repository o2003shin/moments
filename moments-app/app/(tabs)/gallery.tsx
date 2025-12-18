import { router, useFocusEffect, usePathname } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, Touchable, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { File, Paths, Directory } from 'expo-file-system';
import { MomentData } from '../(modals)/createMoment';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';

export interface Moment {
  dirUri: string,
  photoUri: string,
  metadata: string
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const NUM_COLUMNS = 4;
const SPACING = 1;

const ITEM_SIZE = (SCREEN_WIDTH - SPACING * (NUM_COLUMNS + 1)) / NUM_COLUMNS;


export default function TabTwoScreen() {
  const [loading, setLoading] = useState<Boolean>(true);
  const [moments, setMoments] = useState<Moment[] | null>(null);
  const colorScheme = useColorScheme();

  useFocusEffect(useCallback(() => {
    setLoading(true);
    loadFiles();
  }, []))

  const renderMoment = ({ item }: { item: Moment }) => {
    return (
      <TouchableOpacity onPress={() => {
        router.push({
          pathname: '/(modals)/detailedView',
          params: {
            momentDir: item.dirUri,
          }
        });
      }}>
        <Image
          source={item.photoUri}
          style={[style.photo]}
        />
      </TouchableOpacity>
    );
  }

  const loadFiles = () => {
    try {
      const path = `${Paths.document.uri}/moments`;
      const pathData = new Directory(path).list();
      console.log(`Searching <${path}>`)

      const folders = pathData.map(entry => {
        return entry['uri'];
      })
      console.log(`Folders: ${JSON.stringify(folders, null, 2)}`);

      const moments: Moment[] = [];
      for (const folder of folders) {
        const files = new Directory(folder).list();
        console.log('Folder:', folder);
        let moment: Moment = {
          dirUri: folder,
          photoUri: '',
          metadata: ''
        };
        for (let file of files) {
          if (file.uri.endsWith('/photo.jpg')) moment.photoUri = file.uri;
          else if (file.uri.endsWith('/moment.json')) moment.metadata = file.uri;
        }
        console.log('Moment data:', JSON.stringify(moment, null, 2));
        if (moment.metadata && moment.photoUri) moments.push(moment);
      }
      setMoments(moments);
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <View>
      <Text>Loading Moments...</Text>
    </View>
  }

  if (moments?.length === 0) {
    return <View style={{ flex: 1 }}>
      <Text>No moments found. Yet!</Text>
    </View>
  }

  return (
    <SafeAreaView style={{ flex: 1, }}>
      <View style={{ padding: 8 }}>
        <View style={[style.header, { backgroundColor: colorScheme === 'light' ? '#f5f5f5' : '#222' }]}>
          <View style={{ height: 32, width: 32 }}></View>
          <Text style={[style.title, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
            Your Moments
          </Text>
          <View style={{ height: 32, width: 32 }}></View>
        </View>
      </View>
      <FlatList
        data={moments}
        keyExtractor={(item) => item.photoUri}
        numColumns={NUM_COLUMNS}
        style={style.grid}
        renderItem={renderMoment}
      />
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
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
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  grid: {
    marginTop: 15,
    flex: 1
  },
  photo: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: SPACING,
    borderRadius: 5
  },
  title: {
    fontSize: 28,
    fontWeight: '600'
  },
  closeButton: {

  },
});
