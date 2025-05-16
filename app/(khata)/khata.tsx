import { StyleSheet, Image, View, ActivityIndicator, Alert, Pressable, ToastAndroid } from 'react-native';
import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import ScreenWrapper from '@/components/ScreenWrapper';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import InputField from '@/components/InputField';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { useDispatch } from 'react-redux';
import { addKhata } from '@/features/khata/khataSlice';

const Khata = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const dispatch = useDispatch();
    const pickImage = async () => {

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 1,
            allowsEditing: true,
        });

        if (!result.canceled) {
            const img = result.assets[0];
            const extension = img.uri.split('.').pop() || 'jpg';
            const filePath = `${Date.now()}.${extension}`;
            const contentType = `image/${extension}`;

            try {
                setUploadingImage(true);
                const base64 = await FileSystem.readAsStringAsync(img.uri, {
                    encoding: "base64",
                });

                const { data, error } = await supabase.storage
                    .from('kharcha')
                    .upload(`khata_cover_image/${filePath}`, decode(base64), {
                        contentType,
                    });

                if (error) {
                    console.error('Error uploading image:', error.message);
                    Alert.alert('Upload Error', error.message);
                    return;
                }

                const { publicUrl } = supabase.storage
                    .from('kharcha')
                    .getPublicUrl(data.path).data;

                if (!publicUrl) {
                    Alert.alert('Error', 'Could not get public URL for the image');
                    return;
                }

                setCoverImage(publicUrl);
            } catch (err) {
                Alert.alert('Upload Failed', 'An error occurred while uploading the image.');
            } finally {
                setUploadingImage(false);
            }
        }
    };

    const handleCreateKhata = async () => {
        if (!name || !description || !coverImage) {
            ToastAndroid.show('Please fill in all fields', ToastAndroid.SHORT);
            return;
        }

        setLoading(true);

        try {
            const userId = (await supabase.auth.getUser()).data.user?.id;
            const { data, error } = await supabase.from('khata').insert([
                {
                    name,
                    description,
                    cover_image: coverImage,
                    created_by: userId,
                },
            ])
                .select("*, users(full_name, avatar)");

            if (error) {
                console.error('Error creating khata:', error.message);
                ToastAndroid.show(error.message, ToastAndroid.SHORT);
            } else {
                ToastAndroid.show('Khata created successfully!', ToastAndroid.SHORT);
                dispatch(addKhata(data[0]));
                setName('');
                setDescription('');
                setCoverImage(null);
            }
        } catch (err) {
            ToastAndroid.show('An error occurred while creating the khata.', ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <ThemedView style={styles.container}>
                <ThemedText style={styles.title}>Create Your New Kharcha Khata</ThemedText>

                <InputField
                    placeholder="Enter Khata Name"
                    onChange={setName}
                    value={name}
                />
                <InputField
                    placeholder="Enter Khata Description"
                    onChange={setDescription}
                    value={description}
                />

                <Pressable onPress={pickImage}>
                    <View style={styles.imagePickerBox}>
                        {uploadingImage ? (
                            <ActivityIndicator size="large" color="#888" />
                        ) : coverImage ? (
                            <Image source={{ uri: coverImage }} style={styles.imagePreview} />
                        ) : (
                            <>
                                <Ionicons name="image-outline" size={40} color="#888" />
                                <ThemedText style={styles.imagePickerText}>
                                    Tap to select cover image
                                </ThemedText>
                            </>
                        )}
                    </View>
                </Pressable>

                <Button
                    title={loading ? "Creating..." : 'Create Khata'}
                    onPress={handleCreateKhata}
                    style={{ marginTop: 20 }}
                />
            </ThemedView>
        </ScreenWrapper>
    );
};

export default Khata;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    imagePickerBox: {
        height: 200,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#ccc',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa',
    },
    imagePickerText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
});
