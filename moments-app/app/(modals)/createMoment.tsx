import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Keyboard, Pressable } from 'react-native';
import { File, Directory, Paths } from 'expo-file-system';
import { Colors } from "@/constants/theme";

export interface MomentData {
    id: string,
    description: string,
    latitude?: number,
    longitude?: number,
    createdAt: number;
    photo: string,
};

export default function CreateMoment() {
    const [description, onChangeText] = useState<string>('');
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const { photoUri, latitude, longitude } = useLocalSearchParams<{ photoUri: string, latitude: string, longitude: string }>();
    const colorScheme = useColorScheme();
    const descriptionRef = useRef<TextInput>(null);

    useEffect(() => {
        console.log(`Photo captured at: ${photoUri}`);
        console.log(`Location: (${latitude}, ${longitude})`);
    }, []);

    const save = async () => {
        if (isSaving) return;
        setIsSaving(true);
        const timeStamp = Date.now();
        const id = timeStamp.toString();
        const momentsRootDir = new Directory(`${Paths.document.uri}/moments`);
        if (!momentsRootDir.exists) await momentsRootDir.create();

        const momentDir = new Directory(`${momentsRootDir.uri}/${id}`);
        if (!momentDir.exists) await momentDir.create();

        const photoFile = new File(photoUri);
        const destFile = new File(`${momentDir.uri}/photo.jpg`);
        try {
            await photoFile.move(destFile);
        } catch (e) {
            console.error('Failed to move file:', e);
            setIsSaving(false);
            return;
        }
        const moment: MomentData = {
            id,
            description,
            latitude: latitude ? Number(latitude) : undefined,
            longitude: longitude ? Number(longitude) : undefined,
            createdAt: timeStamp,
            photo: 'photo.jpg',
        }

        const metaFile = new File(`${momentDir.uri}/moment.json`);
        try {
            await metaFile.write(JSON.stringify(moment, null, 2));
        } catch (e) {
            console.error('Failed to write:', e);
        }

        setIsSaving(false);
        router.push('/gallery');
    }

    return (
        <SafeAreaView style={[style.container]}>
            <View style={{ flex: 1, padding: 7, gap: 20 }}>
                <View style={style.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={style.closeButton}
                    >
                        <MaterialIcons size={32} name='close' color={'white'} />
                    </TouchableOpacity>
                    {isFocused ? (
                        <>
                            <Text style={[style.title, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
                                Description
                            </Text>
                            <TouchableOpacity onPress={() => {
                                Keyboard.dismiss();
                                setIsFocused(false);
                                console.log('OK Pressed')
                            }}
                            >
                                <Text style={style.confirm}>OK</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={[style.title, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
                                New Moment
                            </Text>
                            <View style={{ width: 50 }}></View>
                        </>
                    )}

                </View>
                {/* Photo */}
                {!isFocused && (
                    <View style={style.photoContainer}>
                        <Image
                            source={{ uri: photoUri }}
                            style={[style.photo]}
                        />
                    </View>
                )}
                {/*  Description */}
                <View
                    style={[
                        style.descriptionContainer,
                        {
                            // borderWidth: isFocused ? 1 : 0,
                            // borderColor: isFocused && colorScheme === 'dark' ? 'white' : 'black',
                            borderRadius: 10
                        }
                    ]}
                >
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ flexGrow: 1 }}
                    >
                        <TextInput
                            ref={descriptionRef}
                            value={description}
                            onChangeText={onChangeText}
                            multiline
                            maxLength={512}
                            placeholder="Add a description..."
                            placeholderTextColor={colorScheme === 'dark' ? 'white' : 'black'}
                            style={[
                                style.description,
                                { color: colorScheme === 'dark' ? 'white' : 'black' }
                            ]}
                            textAlignVertical="top"
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />
                    </ScrollView>
                </View>
                {isFocused && (
                    <Pressable
                        onPress={() => {
                            Keyboard.dismiss();
                        }}
                        style={{
                            flex: 1,
                        }}>
                    </Pressable>
                )}
            </View>


            <TouchableOpacity
                style={[style.save, { backgroundColor: isSaving ? '#06402B' : '#77AB83' }]}
                disabled={isSaving ? true : false}
                onPress={save}>
                <Text style={[{ color: colorScheme === 'dark' ? 'white' : 'black' }]}>Save!</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

const style = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    descriptionContainer: {
        justifyContent: 'flex-start',
        height: 120,
        width: '100%',
        padding: 8,
        borderWidth: 1,
        borderColor: 'white'
    },
    description: {
        height: '100%',
        width: '100%'
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        paddingTop: 15,
        paddingBottom: 15
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold'
    },
    photoContainer: {
        height: '50%',
        // padding: 8,
    },
    photo: {
        flex: 1,
        width: '100%',
        borderRadius: 20,
    },
    closeButton: {
        width: 45,
        height: 45,
        borderRadius: 50,
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center'
    },
    confirm: {
        color: 'lightblue',
        fontSize: 18,
        fontWeight: 'bold'
    },
    save: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#77AB83',
        height: 50,
        width: '95%',
        borderRadius: 10
    }
})