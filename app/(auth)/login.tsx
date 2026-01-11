import {
    StyleSheet,
    ToastAndroid,
    KeyboardAvoidingView,
    Platform,
    useColorScheme,
    View
} from 'react-native';
import React, { useEffect, useState } from 'react';
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
import * as Device from 'expo-device';
import { registerForPushNotificationsAsync } from '@/utils/notification';
import { theme } from '@/constants/theme';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter()
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark';

    const AddLoggedInDevices = async (userId: string) => {
        const expo_push_token = await registerForPushNotificationsAsync()
        const { data, error } = await supabase.from("logged_in_devices").insert({ device_name: Device.designName, user_id: userId, expo_push_token })
        if (error) {
            ToastAndroid.show(error.message, ToastAndroid.SHORT);
        }
    }

    const signInWithEmail = async () => {
        if (!email || !password) {
            ToastAndroid.show('Please fill in all fields', ToastAndroid.SHORT);
            return;
        }

        setLoading(true);
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            ToastAndroid.show(error.message, ToastAndroid.SHORT);
        } else {
            AddLoggedInDevices(data.user?.id)
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
                    <View style={styles.headerContainer}>
                        <Image
                            source={require('@/assets/images/kharcha_auth_3d.png')}
                            style={styles.heroImage}
                            contentFit="contain"
                            transition={500}
                        />
                        <ThemedText style={styles.title}>Welcome Back!</ThemedText>
                        <ThemedText style={styles.subtitle} lightColor={theme.colors.textLight} darkColor="#aaa">
                            Login to manage your expenses effortlessly.
                        </ThemedText>
                    </View>

                    <View style={styles.formContainer}>
                        <InputField
                            placeholder="Email Address"
                            onChange={setEmail}
                            value={email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            icon={<Ionicons name="mail-outline" size={22} color={isDark ? '#ccc' : theme.colors.textLight} />}
                        />
                        <InputField
                            placeholder="Password"
                            onChange={setPassword}
                            value={password}
                            secureTextEntry
                            icon={<Ionicons name="lock-closed-outline" size={22} color={isDark ? '#ccc' : theme.colors.textLight} />}
                        />
                        <View style={styles.forgotPasswordContainer}>
                            <ThemedText style={styles.forgotPasswordText} lightColor={theme.colors.primary} darkColor={theme.colors.primary}>
                                Forgot Password?
                            </ThemedText>
                        </View>

                        <Button
                            title={loading ? 'Logging in...' : 'Login'}
                            onPress={signInWithEmail}
                            style={styles.loginButton}
                            textStyle={styles.loginButtonText}
                        />
                    </View>

                    <View style={styles.footerContainer}>
                        <ThemedText style={styles.footerText} lightColor={theme.colors.textLight} darkColor="#aaa">
                            Don't have an account?
                        </ThemedText>
                        <ThemedText
                            onPress={() => router.push('/signup')}
                            style={styles.signupText}
                            lightColor={theme.colors.primary}
                            darkColor={theme.colors.primary}
                        >
                            Sign Up
                        </ThemedText>
                    </View>
                </ThemedView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp(6),
        justifyContent: 'center',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: hp(4),
    },
    heroImage: {
        width: wp(60),
        height: wp(60),
        marginBottom: hp(2),
    },
    title: {
        fontSize: wp(8),
        fontWeight: '700',
        marginBottom: hp(1),
        textAlign: 'center',
    },
    subtitle: {
        fontSize: wp(4),
        textAlign: 'center',
        paddingHorizontal: wp(10),
    },
    formContainer: {
        gap: hp(2.5),
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: hp(1),
    },
    forgotPasswordText: {
        fontSize: wp(3.5),
        fontWeight: '600',
    },
    loginButton: {
        borderRadius: 16,
        paddingVertical: hp(1.8),
        shadowColor: theme.colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    loginButtonText: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp(4),
        gap: 5,
    },
    footerText: {
        fontSize: wp(3.8),
    },
    signupText: {
        fontSize: wp(3.8),
        fontWeight: '700',
    },
});