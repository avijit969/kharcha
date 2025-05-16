import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { theme } from '../constants/theme'

interface Props {
    size?: 'large' | 'small'
    color?: string
}
export default function Loading({ size = 'large', color = theme.colors.primary }: Props) {
    return (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size={size} color={color} />
        </View>
    )
}

const styles = StyleSheet.create({})