import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'

const notification = () => {
    return (
        <ScreenWrapper>
            <ThemedView style={{ flex: 1 }}>
                <ThemedText>notification</ThemedText>
            </ThemedView>
        </ScreenWrapper>
    )
}

export default notification

const styles = StyleSheet.create({})