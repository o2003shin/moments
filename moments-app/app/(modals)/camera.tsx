// app/camera.tsx
import { View, Text, TouchableOpacity, Button, useColorScheme, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraType, CameraView, FlashMode, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

export default function CameraScreen() {
    const router = useRouter();
    const [permissions, requestPermissions] = useCameraPermissions();
    const [cameraMode, setCameraMode] = useState<CameraType>('back');
    const [flashMode, setFlashMode] = useState<FlashMode>('off');
    const [loading, setLoading] = useState<boolean>(false);
    const cameraRef = useRef<CameraView>(null);

    const colorScheme = useColorScheme();

    if (!permissions?.granted) {
        requestPermissions();
        return <SafeAreaView>
            <Text style={{ color: 'white', alignSelf: 'center' }}>We need access to your camera.</Text>
            <Button title='Allow Camera Access' onPress={requestPermissions} />
        </SafeAreaView>
    };

    const flipCamera = () => {
        if (cameraMode === 'back') setCameraMode('front');
        else setCameraMode('back');
    };

    const updateFlash = () => {
        if (flashMode === 'auto') setFlashMode('on');
        else if (flashMode === 'on') setFlashMode('off');
        else if (flashMode === 'off') setFlashMode('auto');
    };

    const takePhoto = async () => {
        console.log('Taking photo.');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        if (cameraRef.current) {
            setLoading(true);
            const photo = await cameraRef.current?.takePictureAsync({
                quality: 1,
            });
            
            let latitude;
            let longitude;
            
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High
                });
                latitude = loc.coords.latitude;
                longitude = loc.coords.longitude;
            }
            setLoading(false);
            router.push({
                pathname: '/(modals)/createMoment',
                params: {
                    photoUri: photo.uri,
                    latitude,
                    longitude,
                },
            });
        };
    };

    return (
        <SafeAreaView style={style.container}>
            <View style={style.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={style.closeButton}
                >
                    <MaterialIcons size={32} name='close' color={'white'} />
                </TouchableOpacity>
                <Text style={[style.title, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
                    New Moment
                </Text>
                <TouchableOpacity onPress={updateFlash}>
                    <MaterialIcons size={32} name={flashMode === 'auto' ? 'flash-auto' : flashMode === 'off' ? 'flash-off' : 'flash-on'} color='white' />
                </TouchableOpacity>
            </View>
            <View style={style.cameraContainer}>
                <CameraView
                    ref={cameraRef}
                    style={style.camera}
                    facing={cameraMode === 'back' ? 'back' : 'front'}
                    flash={flashMode === 'auto' ? 'auto'
                        : flashMode === 'off' ? 'off'
                            : 'on'
                    }
                />
                {loading && (
                    <View style={style.loadingOverlay}>
                        <Text style={{ color: 'white' }}>
                            Getting things ready...
                        </Text>
                    </View>
                )}
            </View>
            <View style={style.buttonArea}>
                <View style={{ width: 50 }}></View>
                <TouchableOpacity style={style.cameraButton} onPress={takePhoto}></TouchableOpacity>
                <TouchableOpacity disabled={loading} style={[style.flipCamera, loading && { opacity: 0.5 }]} onPress={flipCamera}>
                    <MaterialIcons size={50} name='flip-camera-ios' color='white' />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const style = StyleSheet.create({
    container: {
        flex: 1,
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
    title: {
        fontSize: 28,
        fontWeight: '600'
    },
    cameraContainer: {
        height: '50%',
        padding: 8,
    },
    camera: {
        flex: 1,
        width: '100%',
        borderRadius: 20,
    },
    buttonArea: {
        flex: 2,
        justifyContent: 'space-around',
        flexDirection: 'row',
    },
    cameraButton: {
        height: 70,
        width: 70,
        backgroundColor: 'white',
        borderRadius: 100,
        borderColor: 'grey',
        alignSelf: 'center',
        outlineColor: 'grey',
        outlineWidth: 5,
    },
    flipCamera: {
        alignSelf: 'center',
    },
    closeButton: {
        width: 45,
        height: 45,
        borderRadius: 50,
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    }
})