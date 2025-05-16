import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { ThemedView } from './ThemedView'
import { Ionicons } from '@expo/vector-icons'
import { wp } from '@/helpers/common'
import { theme } from '@/constants/theme'

const CreateKhata = () => {
    const router = useRouter()
    const colorScheme = useColorScheme();
    const styles = colorScheme === 'dark' ? darkStyles : lightStyles;
    return (
        <TouchableOpacity onPress={() => router.push('/khata')} style={styles.contianer}>
            <ThemedView style={styles.buttonContianer}>
                <Ionicons name="add" size={wp(12)} color="black" />
            </ThemedView>
        </TouchableOpacity>
    )
}

export default CreateKhata

const darkStyles = StyleSheet.create({
    contianer: {
        position: 'absolute',
        bottom: 20,
        right: 20
    },
    buttonContianer: {
        backgroundColor: 'white',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    }
})

const lightStyles = StyleSheet.create({
    contianer: {
        position: 'absolute',
        bottom: 20,
        right: 20
    },
    buttonContianer: {
        borderWidth: 1,
        padding: wp(2),
        borderRadius: 50,
        borderColor: theme.colors.darkLight,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    }
})