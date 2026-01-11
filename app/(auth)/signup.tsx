import {
    StyleSheet,
    ToastAndroid,
    KeyboardAvoidingView,
    Platform,
    useColorScheme,
    ScrollView,
    View,
    TouchableOpacity
} from 'react-native';
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
import { theme } from '@/constants/theme';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter()
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark';

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
                behavior={Platform.OS === 'ios' ? 'padding' : "height"}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <ThemedView style={styles.container}>
                        <View style={styles.headerContainer}>
                            <Image
                                source={require('@/assets/images/auth_illustration.png')}
                                style={styles.heroImage}
                                contentFit="contain"
                                transition={500}
                            />
                            <ThemedText style={styles.title}>Create Account</ThemedText>
                            <ThemedText style={styles.subtitle} lightColor={theme.colors.textLight} darkColor="#aaa">
                                Join Kharcha to start saving today!
                            </ThemedText>
                        </View>

                        <View style={styles.formContainer}>
                            <InputField
                                placeholder="Full Name"
                                onChange={setFullName}
                                value={fullName}
                                icon={<Ionicons name="person-outline" size={22} color={isDark ? '#ccc' : theme.colors.textLight} />}
                            />
                            <InputField
                                placeholder="Username"
                                onChange={setUsername}
                                value={username}
                                icon={<Ionicons name="at" size={22} color={isDark ? '#ccc' : theme.colors.textLight} />}
                            />
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
                                secureTextEntry={!showPassword}
                                icon={<Ionicons name="lock-closed-outline" size={22} color={isDark ? '#ccc' : theme.colors.textLight} />}
                                rightIcon={
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={22}
                                            color={isDark ? '#ccc' : theme.colors.textLight}
                                        />
                                    </TouchableOpacity>
                                }
                            />

                            <Button
                                title={loading ? 'Creating Account...' : 'Sign Up'}
                                onPress={signInWithEmail}
                                style={styles.signupButton}
                                textStyle={styles.signupButtonText}
                                backgroundColor={theme.colors.primary}
                            />
                        </View>

                        <View style={styles.footerContainer}>
                            <ThemedText style={styles.footerText} lightColor={theme.colors.textLight} darkColor="#aaa">
                                Already have an account?
                            </ThemedText>
                            <ThemedText
                                onPress={() => router.push('/login')}
                                style={styles.loginText}
                                lightColor={theme.colors.primary}
                                darkColor={theme.colors.primary}
                            >
                                Login
                            </ThemedText>
                        </View>
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
        paddingHorizontal: wp(6),
        justifyContent: 'center',
        paddingBottom: hp(4),
    },
    headerContainer: {
        alignItems: 'center',
        marginVertical: hp(2),
    },
    heroImage: {
        width: wp(50),
        height: wp(50),
        marginBottom: hp(1),
    },
    title: {
        fontSize: wp(8),
        fontWeight: '800',
        marginBottom: hp(1),
        textAlign: 'center',
    },
    subtitle: {
        fontSize: wp(4),
        textAlign: 'center',
        paddingHorizontal: wp(10),
        lineHeight: wp(6),
    },
    formContainer: {
        gap: hp(2.5),
        marginTop: hp(2),
    },
    signupButton: {
        borderRadius: 18,
        paddingVertical: hp(2),
        shadowColor: theme.colors.primary,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    signupButtonText: {
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
    loginText: {
        fontSize: wp(3.8),
        fontWeight: '700',
    },
});
