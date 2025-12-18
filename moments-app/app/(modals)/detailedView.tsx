import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Directory, File, } from 'expo-file-system';
import { Image } from 'expo-image';
import MapView, { Marker } from "react-native-maps";

interface Moment {
    metaUri: string,
    photoUri: string,
}

export default function DetailedView() {
    const { momentDir } = useLocalSearchParams<{ momentDir: string }>();
    const [error, setError] = useState<boolean>(false);
    const [description, setDescription] = useState<string>('');
    const [dateCreated, setDateCreated] = useState<Date | null>(null);
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [metaUri, setMetaUri] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const colorScheme = useColorScheme();

    useEffect(() => {
        const loadMoment = async () => {
            try {
                console.log('Looking at', momentDir);
                let moment: Moment = {
                    metaUri: '',
                    photoUri: '',
                }
                const files = new Directory(momentDir).list().map(entry => {
                    return entry['uri'];
                });

                for (let file of files) {
                    if (file.endsWith('/photo.jpg')) moment.photoUri = file;
                    else if (file.endsWith('/moment.json')) moment.metaUri = file;
                }
                setPhotoUri(moment.photoUri);
                setMetaUri(moment.metaUri);

                const meta = moment.metaUri;
                if (meta) {
                    const file = new File(meta);
                    const text = file.textSync();
                    const data = JSON.parse(text);
                    console.log('Data:', JSON.stringify(data, null, 2));
                    const dateCreated = new Date(data.createdAt);
                    setDescription(data.description);
                    setDateCreated(dateCreated);
                    if (data.latitude && data.longitude) {
                        setLocation({ latitude: data.latitude, longitude: data.longitude });
                    }
                }

            } catch (e) {
                console.error('Something went wrong:', e);
                setError(true);
            }
        }

        loadMoment();
    }, [momentDir])

    if (error) {
        return <View>
            <Text>Something went wrong.</Text>
        </View>
    }

    return (
        <SafeAreaView style={style.container}>
            <View style={style.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={style.closeButton}
                >
                    <MaterialIcons size={32} name='arrow-back' color={'white'} />
                </TouchableOpacity>
                <Text style={[style.title, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
                    Your Moment
                </Text>
                <View style={{ height: 32, width: 32 }}></View>
            </View>
            <ScrollView
                style={style.scrollView}
                contentContainerStyle={style.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {photoUri && (
                    <View style={style.photoContainer}>
                        <Image
                            source={photoUri}
                            style={{ width: '100%', borderRadius: 5, aspectRatio: 1}}
                        />
                    </View>
                )}
                <Text style={[style.description, { color: colorScheme === 'dark' ? 'white' : 'black', fontSize: 18, marginVertical: 4, fontWeight: '500' }]}>{dateCreated?.toDateString()}</Text>
                <Text style={[style.description, { color: colorScheme === 'dark' ? 'white' : 'black', marginBottom: 8 }]}>{description}</Text>

                {location && (
                    <View style={style.mapContainer}>
                        <MapView
                            style={style.map}
                            initialRegion={{
                                latitude: location.latitude,
                                longitude: location.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01
                            }}
                            scrollEnabled={false}
                            zoomEnabled={false}
                            pitchEnabled={false}
                            rotateEnabled={false}
                        >
                            <Marker coordinate={location} title='Moment Location' />
                        </MapView>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

const style = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        paddingTop: 30,
        paddingBottom: 30
    },
    closeButton: {
        width: 45,
        height: 45,
        borderRadius: 50,
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 28,
    },
    scrollView: {
        flex: 1
    },
    photoContainer: {
        width: '100%',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 8
    },
    description: {
        fontSize: 20,
    },
    mapContainer: {
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8
    },
    map: {
        flex: 1
    },
    scrollContent: {
        padding: 8,
        paddingBottom: 24
    }
})