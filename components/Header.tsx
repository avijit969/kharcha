import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { ThemedView } from './ThemedView'
import { Ionicons } from '@expo/vector-icons'
import { ThemedText } from './ThemedText'
import { theme } from '@/constants/theme'
import { wp } from '@/helpers/common'
import { useColorScheme } from '@/hooks/useColorScheme.web'
import { useRouter } from 'expo-router'

const Header = ({ name, right }: { name: string, right?: React.ReactNode }) => {
    const theme = useColorScheme()
    const router = useRouter()
    return (
        <ThemedView style={styles.header}>
            <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="arrow-back" size={24} color={theme === 'dark' ? 'white' : 'black'} style={[styles.backBtnIcon, { backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} onPress={() => router.back()} />
                <ThemedText style={styles.title}>{name}</ThemedText>
            </ThemedView>
            {right && right}
        </ThemedView>
    )
}

export default Header

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'space-between',
        marginTop: 10,
        marginLeft: wp(1)
    },
    backBtnIcon: {
        padding: wp(2),
        borderRadius: theme.radius.sm
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
})