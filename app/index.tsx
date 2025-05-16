import { StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Loading from '@/components/Loading'
import { registerForPushNotificationsAsync } from '@/utils/notification';
import * as Notifications from 'expo-notifications';


const index = () => {

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>
            <Loading />
        </View>
    )
}

export default index

const styles = StyleSheet.create({})