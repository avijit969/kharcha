import React, { useState, useEffect } from 'react';
import {
    Modal,
    StyleSheet,
    View,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ToastAndroid,
} from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { KhataData } from '@/app/(tabs)/home';
import InputField from './InputField';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme.web';
import { hp, wp } from '@/helpers/common';
import { Image } from 'expo-image';
import { useDispatch } from 'react-redux';
import { updateKhata } from '@/features/khata/khataSlice';

type EditKhataActionModalProps = {
    visible: boolean;
    khataDetails: KhataData;
    onClose: () => void;
};

const EditKhataActionModal: React.FC<EditKhataActionModalProps> = ({
    visible,
    khataDetails,
    onClose,
}) => {
    const [name, setName] = useState(khataDetails.name);
    const [description, setDescription] = useState(khataDetails.description || '');
    const [coverImage, setCoverImage] = useState(khataDetails.cover_image || '');
    const [uploadingImage, setUploadingImage] = useState(false);
    const theme = useColorScheme();
    const dispatch = useDispatch();
    useEffect(() => {
        setName(khataDetails.name);
        setDescription(khataDetails.description || '');
        setCoverImage(khataDetails.cover_image || '');
    }, [khataDetails]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const img = result.assets[0];
            const extension = img.uri.split('.').pop() || 'jpg';
            const filePath = `khata_cover_image/${Date.now()}.${extension}`;
            const contentType = `image/${extension}`;

            try {
                setUploadingImage(true);
                const base64 = await FileSystem.readAsStringAsync(img.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

                const { data, error } = await supabase.storage
                    .from('kharcha')
                    .upload(filePath, byteArray, {
                        contentType,
                        upsert: true,
                    });

                if (error) {
                    ToastAndroid.show(error.message, ToastAndroid.SHORT);
                    return;
                }

                const { data: urlData } = supabase.storage
                    .from('kharcha')
                    .getPublicUrl(data.path);

                if (urlData?.publicUrl) {
                    setCoverImage(urlData.publicUrl);
                }
            } catch (err: any) {
                ToastAndroid.show(err.message || 'Something went wrong', ToastAndroid.SHORT);
            } finally {
                setUploadingImage(false);
            }
        }
    };

    const handleSave = async () => {
        if (name.trim() === '') {
            ToastAndroid.show('Please enter a name', ToastAndroid.SHORT);
            return;
        }

        const { data, error } = await supabase.from('khata').update({
            name,
            description,
            cover_image: coverImage
        }).eq('id', khataDetails.id)
            .select('*, users(full_name, avatar)')
            .single();

        if (error) {
            ToastAndroid.show(error.message, ToastAndroid.SHORT);
            return;
        }
        dispatch(updateKhata(data));
        onClose();
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardAvoid}
            >
                <ThemedView style={styles.modalContainer}>
                    {/* Header */}
                    <ThemedView style={styles.header}>
                        <Ionicons
                            name='arrow-back'
                            size={24}
                            color={theme === 'dark' ? 'white' : 'black'}
                            onPress={onClose}
                            style={[
                                styles.backBtnIcon,
                                {
                                    backgroundColor:
                                        theme === 'dark'
                                            ? 'rgba(255, 255, 255, 0.1)'
                                            : 'rgba(0, 0, 0, 0.1)',
                                },
                            ]}
                        />
                        <ThemedText style={styles.title}>Edit Khata {khataDetails.name}</ThemedText>
                    </ThemedView>

                    {/* Cover Image */}
                    <TouchableOpacity onPress={pickImage}>
                        <Image
                            source={{
                                uri: coverImage || 'https://placehold.co/600x400?text=Pick+Image',
                            }}
                            style={styles.coverImage}
                            contentFit="cover"
                        />
                    </TouchableOpacity>

                    {/* Inputs */}
                    <InputField
                        placeholder="Enter Khata Name"
                        value={name}
                        onChange={setName}
                    />

                    <InputField
                        placeholder="Enter Description (optional)"
                        value={description}
                        onChange={setDescription}
                    />

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <ThemedText style={{ fontWeight: '600' }}>Cancel</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <ThemedText style={styles.buttonText}>
                                {uploadingImage ? 'Uploading...' : 'Update'}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </ThemedView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default EditKhataActionModal;

const styles = StyleSheet.create({
    keyboardAvoid: {
        flex: 1,
    },
    modalContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: hp(2),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: hp(2),
        gap: wp(2),
    },
    backBtnIcon: {
        padding: 8,
        borderRadius: 8,
    },
    coverImage: {
        width: '100%',
        height: hp(30),
        borderRadius: 10,
        marginBottom: 16,
        backgroundColor: '#eee',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
    cancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#ccc',
        borderRadius: 8,
        marginRight: 10,
    },
    saveButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#4CAF50',
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
});
