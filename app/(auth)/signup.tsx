import { StyleSheet, ToastAndroid, View, KeyboardAvoidingView, Platform, useColorScheme, ScrollView } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { hp, wp } from '@/helpers/common';
import InputField from '@/components/InputField';
import Button from '@/components/Button';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { registerForPushNotificationsAsync } from '@/utils/notification';
const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter()
    const theme = useColorScheme()

    const signInWithEmail = async () => {
        const expoPushToken = await registerForPushNotificationsAsync();
        if (!email || !password) {
            ToastAndroid.show('Please fill in all fields', ToastAndroid.SHORT);
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email, password, options: {
                data: {
                    username: username,
                    full_name: fullName,
                    expo_push_token: expoPushToken
                }
            }
        });

        if (error) {
            ToastAndroid.show(error.message, ToastAndroid.SHORT);
        } else {
            ToastAndroid.show('Signup Successful', ToastAndroid.SHORT);
            router.replace("/login")
        }

        setLoading(false);
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <ThemedView style={styles.container}>
                        <ThemedView>
                            <ThemedText style={styles.loginText}>Signup to Kharcha</ThemedText>
                            <Image
                                source={require('@/assets/images/kharcha_auth.svg')}
                                style={{
                                    width: 340,
                                    height: 280,
                                    borderRadius: 20,
                                    alignSelf: 'center',
                                }}
                                contentFit="cover"
                                transition={1000}
                            />
                            <InputField
                                placeholder="Email"
                                onChange={setEmail}
                                value={email}
                                icon={
                                    <Ionicons
                                        name="mail-outline"
                                        size={24}
                                        color={theme == 'dark' ? '#fff' : '#000'}
                                    />
                                }
                            />
                            <InputField
                                placeholder="username"
                                onChange={setUsername}
                                value={username}
                                icon={
                                    <Ionicons
                                        name="person-circle"
                                        size={24}
                                        color={theme == 'dark' ? '#fff' : '#000'}
                                    />
                                }
                            />
                            <InputField
                                placeholder="Full Name"
                                onChange={setFullName}
                                value={fullName}
                                icon={
                                    <Ionicons
                                        name="person-circle"
                                        size={24}
                                        color={theme == 'dark' ? '#fff' : '#000'}
                                    />
                                }
                            />
                            <InputField
                                placeholder="Password"
                                onChange={setPassword}
                                value={password}
                                secureTextEntry
                                icon={
                                    <Ionicons
                                        name="lock-closed-outline"
                                        size={24}
                                        color={theme == 'dark' ? '#fff' : '#000'}
                                    />
                                }
                            />
                        </ThemedView>

                        <Button
                            title={loading ? 'Logging in...' : 'Signup'}
                            onPress={signInWithEmail}
                            style={{ width: '100%' }}
                        />
                        <ThemedText
                            style={{ textAlign: 'center' }}
                            lightColor="#000"
                            darkColor="#fff"
                        >
                            Already have an account?{' '}
                            <ThemedText
                                onPress={() => router.push('/login')}
                                style={{ fontWeight: 'bold' }}
                                lightColor="#000"
                                darkColor="#fff"
                            >
                                Login
                            </ThemedText>
                        </ThemedText>
                    </ThemedView>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>

    );
};

export default Signup;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: hp(2),
        paddingHorizontal: wp(5),
        justifyContent: 'center',
    },
    loginText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
    },
});
