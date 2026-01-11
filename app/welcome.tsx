import { StyleSheet, View } from 'react-native'
import React from 'react'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import ScreenWrapper from '@/components/ScreenWrapper'
import { theme } from '@/constants/theme'
import Button from '@/components/Button'
import { hp, wp } from '@/helpers/common'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'

const Welcome = () => {
    const router = useRouter()

    return (
        <ScreenWrapper>
            <ThemedView style={styles.container}>
                {/* Hero Image Section */}
                <View style={styles.imageContainer}>
                    <LinearGradient
                        colors={[theme.colors.primary + '20', theme.colors.primary + '50', 'transparent']}
                        style={styles.gradient}
                    />
                    <Image
                        source={require('@/assets/images/welcome_illustration.png')}
                        style={styles.heroImage}
                        contentFit="contain"
                        transition={1000}
                    />
                </View>

                {/* Content Section */}
                <View style={styles.contentContainer}>
                    <View>
                        <ThemedText style={styles.title} lightColor={theme.colors.text} darkColor="#fff">
                            Tuma Paisa,{'\n'}
                            Tuma <ThemedText style={{ color: theme.colors.primary }}>Control</ThemedText>
                        </ThemedText>
                        <ThemedText style={styles.subtitle} lightColor={theme.colors.textLight} darkColor="#aaa">
                            Manage costs, track daily expenses, and save for the future.
                            {'\n'}<ThemedText style={{ fontWeight: 'bold', color: theme.colors.primary }}>Hisab Rakhiba Ta?</ThemedText>
                        </ThemedText>
                    </View>

                    <View style={styles.buttonContainer}>
                        <Button
                            title='Chalo Start Kariba'
                            backgroundColor={theme.colors.primary}
                            onPress={() => router.push('/login')}
                            style={styles.button}
                            textStyle={styles.buttonText}
                        />
                        <View style={styles.footerRow}>
                            <ThemedText style={styles.footerText}>New here?</ThemedText>
                            <ThemedText
                                style={[styles.footerText, styles.linkText]}
                                onPress={() => router.push('/signup')}
                            >
                                Create an account
                            </ThemedText>
                        </View>
                    </View>
                </View>
            </ThemedView>
        </ScreenWrapper>
    )
}

export default Welcome

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    imageContainer: {
        flex: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        position: 'relative',
    },
    gradient: {
        position: 'absolute',
        width: wp(100),
        height: hp(50),
        top: 0,
        opacity: 0.5,
    },
    heroImage: {
        width: wp(90),
        height: wp(90),
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: wp(6),
        justifyContent: 'space-evenly',
    },
    title: {
        fontSize: wp(8.5),
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: hp(2),
        lineHeight: wp(11),
    },
    subtitle: {
        fontSize: wp(4),
        textAlign: 'center',
        lineHeight: wp(6),
        paddingHorizontal: wp(4),
    },
    buttonContainer: {
        gap: hp(2),
        marginBottom: hp(2),
    },
    button: {
        borderRadius: 18,
        paddingVertical: hp(2.2),
        shadowColor: theme.colors.primary,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    buttonText: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 5,
    },
    footerText: {
        fontSize: wp(3.8),
        color: '#888',
    },
    linkText: {
        color: theme.colors.primary,
        fontWeight: '700',
    },
})