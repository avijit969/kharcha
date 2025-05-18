import {
    StyleSheet,
    Image,
    View,
    TextInput,
    ActivityIndicator,
    Alert,
    ToastAndroid,
    Pressable,
} from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import Button from '@/components/Button'
import { supabase } from '@/lib/supabase'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { decode } from 'base64-arraybuffer'
import { useRouter } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { updateUser } from '@/features/user/userSclice'
export interface User {
    id: string
    email: string
    avatar: string
    username: string
    full_name: string
}

const Profile = () => {
    const user = useSelector((state: RootState) => state.user.user)
    const [userInput, setUserInput] = useState<User>(user)
    const [updating, setUpdating] = useState(false)
    const [uploading, setUploading] = useState(false)

    const dispatch = useDispatch()
    const router = useRouter()

    const updateProfile = async () => {
        setUpdating(true)
        try {
            const { data, error } = await supabase
                .from('users')
                .update({
                    full_name: userInput.full_name,
                    username: userInput.username,
                    avatar: userInput.avatar,
                    email: userInput.email,
                })
                .eq('id', userInput.id)
                .select()

            if (error) throw error
            ToastAndroid.show('Profile updated', ToastAndroid.SHORT)
            dispatch(updateUser(data[0]))
        } catch (error: any) {
            ToastAndroid.show(error.message, ToastAndroid.SHORT)
        } finally {
            setUpdating(false)
        }
    }

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 1,
            allowsEditing: true,
            aspect: [1, 1],
            base64: true,
        })

        if (!result.canceled && result.assets?.[0]) {
            const img = result.assets[0]
            const extension = img.uri.split('.').pop() || 'jpg'
            const filePath = `avatar/${Date.now()}.${extension}`
            const contentType = `image/${extension}`

            try {
                setUploading(true)

                const base64 = await FileSystem.readAsStringAsync(img.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                })

                const { data, error: uploadError } = await supabase.storage
                    .from('users')
                    .upload(filePath, decode(base64), {
                        contentType,
                        upsert: true,
                    })

                if (uploadError) throw uploadError

                const { publicUrl } = supabase.storage
                    .from('users')
                    .getPublicUrl(data.path).data

                if (!publicUrl) throw new Error('Unable to get public URL')

                const updatedUser = { ...userInput, avatar: publicUrl }
                setUserInput(updatedUser)
                dispatch(updateUser(updatedUser))

                // Save avatar in database
                await supabase.from('users')
                    .update({ avatar: publicUrl })
                    .eq('id', userInput.id)

                ToastAndroid.show('Avatar updated!', ToastAndroid.SHORT)
            } catch (err: any) {
                Alert.alert('Upload Error', err.message || 'Unexpected error')
            } finally {
                setUploading(false)
            }
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.replace('/welcome')
    }

    return (
        <ScreenWrapper>
            <ThemedView style={styles.container}>
                <Pressable onPress={pickImage}>
                    <View style={styles.avatarBox}>
                        {uploading ? (
                            <ActivityIndicator size="large" />
                        ) : userInput.avatar ? (
                            <Image source={{ uri: userInput.avatar }} style={styles.avatar} />
                        ) : (
                            <ThemedText>No Avatar</ThemedText>
                        )}
                    </View>
                </Pressable>

                <Button title="Change Avatar" onPress={pickImage} style={{ marginBottom: 10 }} />

                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                    value={userInput.email}
                    editable
                    style={styles.input}
                    onChangeText={(text) =>
                        setUserInput((prev) => ({ ...prev, email: text }))
                    }
                />

                <ThemedText style={styles.label}>Full Name</ThemedText>
                <TextInput
                    value={userInput.full_name}
                    onChangeText={(text) =>
                        setUserInput((prev) => ({ ...prev, full_name: text }))
                    }
                    style={styles.input}
                />

                <ThemedText style={styles.label}>Username</ThemedText>
                <ThemedText style={styles.input}>{userInput.username}</ThemedText>

                <Button
                    title={updating ? 'Updating...' : 'Update Profile'}
                    onPress={updateProfile}
                    style={{ marginTop: 10 }}
                />
                <Button
                    title="Logout"
                    backgroundColor="red"
                    onPress={handleLogout}
                    style={{ marginTop: 20 }}
                />
            </ThemedView>
        </ScreenWrapper>
    )
}

export default Profile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    avatarBox: {
        alignSelf: 'center',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        overflow: 'hidden',
        backgroundColor: '#f1f1f1',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    label: {
        marginTop: 10,
        fontWeight: 'bold',
    },
    input: {
        color: 'white',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginTop: 5,
    },
})
