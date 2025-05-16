import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import ScreenWrapper from '@/components/ScreenWrapper'
import { theme } from '@/constants/theme'
import Button from '@/components/Button'
import { hp, wp } from '@/helpers/common'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'

const welcome = () => {
    const router = useRouter()

    return (
        <ScreenWrapper>
            <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: hp(5) }}>
                <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }} lightColor={theme.colors.primary}>Wlcome to Kharcha</ThemedText>
                <Image source={require('@/assets/images/kharcha_auth.svg')} style={{ width: 350, height: 350, resizeMode: 'contain', borderRadius: 20 }}

                    contentFit="cover"
                    transition={1000} />
                <Button
                    title='Get Started'
                    backgroundColor={theme.colors.primary}
                    onPress={() => {
                        router.push('/signup')
                    }}
                    style={{ width: wp(80) }}
                />
            </ThemedView>
        </ScreenWrapper>
    )
}

export default welcome

const styles = StyleSheet.create({})