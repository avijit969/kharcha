import { StyleSheet, ToastAndroid, View, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
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
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter()
    const theme = useColorScheme()
    const signInWithEmail = async () => {
        if (!email || !password) {
            ToastAndroid.show('Please fill in all fields', ToastAndroid.SHORT);
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            ToastAndroid.show(error.message, ToastAndroid.SHORT);
        } else {
            ToastAndroid.show('Login Successful', ToastAndroid.SHORT);
            router.replace("/home")
        }

        setLoading(false);
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ThemedView style={styles.container}>
                    <ThemedView>
                        <ThemedText style={styles.loginText}>Login To Kharcha</ThemedText>
                        <Image source={require('@/assets/images/kharcha_auth.svg')} style={{ width: 340, height: 340, alignSelf: 'center', borderRadius: 20 }}
                            contentFit="cover"
                            transition={1000}
                        />
                        <InputField
                            placeholder="Email"
                            onChange={setEmail}
                            value={email}
                            icon={<Ionicons name="mail-outline" size={24} color={theme == 'dark' ? '#fff' : '#000'} />}
                        />
                        <InputField
                            placeholder="Password"
                            onChange={setPassword}
                            value={password}
                            secureTextEntry
                            icon={<Ionicons name="lock-closed-outline" size={24} color={theme == 'dark' ? '#fff' : '#000'} />}
                        />
                    </ThemedView>

                    <Button
                        title={loading ? 'Logging in...' : 'Login'}
                        onPress={signInWithEmail}
                        style={{ width: '100%' }}
                    />
                    <ThemedText style={{ textAlign: 'center', marginTop: 10 }} lightColor="#000" darkColor="#fff">
                        Don't have an account?{' '}
                        <ThemedText
                            onPress={() => router.replace('/signup')}
                            style={{ fontWeight: 'bold' }}
                            lightColor="#000"
                            darkColor="#fff"
                        >
                            Sign Up
                        </ThemedText>
                    </ThemedText>
                </ThemedView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: hp(5),
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
