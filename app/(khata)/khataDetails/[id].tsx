import { StyleSheet, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { hp } from '@/helpers/common'
import { Image } from 'expo-image'
import { theme as appTheme } from '@/constants/theme'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import Button from '@/components/Button'
import { useColorScheme } from '@/hooks/useColorScheme.web'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'

const KhataDetailes = () => {
    const { id } = useLocalSearchParams()
    const khata = useSelector((state: RootState) => state.khata).filter((item) => item.id === id)[0]
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'
    const router = useRouter()
    return (
        <ScreenWrapper>
            <ThemedView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f2f2f2' }]}>
                <Header name={khata.name} />
                {/* Cover Image */}
                <Image
                    source={{ uri: khata.cover_image }}
                    style={styles.coverImage}
                    contentFit="cover"
                    transition={1000}
                />

                {/* Title & Description */}
                <View style={styles.textBlock}>
                    {/* <ThemedText style={[styles.title, { color: isDark ? '#fff' : '#111' }]}>
                        {khata.name}
                    </ThemedText> */}
                    <ThemedText style={[styles.description, { color: isDark ? '#aaa' : '#555' }]}>
                        {khata.description}
                    </ThemedText>
                </View>

                {/* Info Card */}
                <View style={[
                    styles.infoCard,
                    {
                        backgroundColor: isDark ? '#1e1e1e' : '#fff',
                        shadowColor: isDark ? '#000' : '#aaa',
                    }
                ]}>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={20} color={isDark ? '#fff' : '#333'} />
                        <ThemedText style={[styles.infoLabel, { color: isDark ? '#fff' : '#222' }]}>Created by</ThemedText>
                        <ThemedText style={[styles.infoValue, { color: isDark ? '#eee' : '#555' }]}>{khata.users.full_name}</ThemedText>
                    </View>

                    {/* Clickable Members */}
                    <TouchableOpacity
                        style={styles.infoRow}
                        onPress={() => router.push(`/(khata)/members/${id}` as any)}>
                        <Ionicons name="people-outline" size={20} color={isDark ? '#fff' : '#333'} />
                        <ThemedText style={[styles.infoLabel, { color: isDark ? '#fff' : '#222' }]}>Members</ThemedText>
                        <Ionicons name="chevron-forward" size={24} color={isDark ? '#fff' : '#333'} />
                    </TouchableOpacity>

                    <View style={styles.infoRow}>
                        <MaterialIcons name="attach-money" size={20} color={isDark ? '#fff' : '#333'} />
                        <ThemedText style={[styles.infoLabel, { color: isDark ? '#fff' : '#222' }]}>Total Khara Heichi</ThemedText>
                        <ThemedText style={[styles.infoValue, { color: isDark ? '#eee' : '#555' }]}>₹ 200</ThemedText>
                    </View>
                </View>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                    <Button
                        title="✔ Mark Complete"
                        onPress={() => {

                        }}
                    />
                    <Button
                        title="🧾 All Kharchas"
                        onPress={() => {
                            router.push(`/(kharcha)/kharcha/${khata.id}` as any)
                        }}
                    />
                </View>
            </ThemedView>
        </ScreenWrapper >
    )
}

export default KhataDetailes

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: hp(1),
        gap: hp(2),
    },
    coverImage: {
        width: '100%',
        height: hp(30),
        borderRadius: appTheme.radius.lg,
    },
    textBlock: {
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        fontSize: 16,
    },
    infoCard: {
        borderRadius: appTheme.radius.md,
        padding: hp(2),
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
        gap: hp(1.5),
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: hp(1),
        justifyContent: 'space-between',
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '400',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: hp(1),
    },
    button: {

    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    }
})
