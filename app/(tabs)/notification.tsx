import { StyleSheet, FlatList, TouchableOpacity, ToastAndroid } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { useColorScheme } from '@/hooks/useColorScheme'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Header from '@/components/Header'
import { hp, wp } from '@/helpers/common'
import ActionModal from '@/components/ActionModal'
import { supabase } from '@/lib/supabase'
import { clearNotifications } from '@/features/notification/notificationSclice'

const NotificationScreen = () => {
    const notifications = useSelector((state: RootState) => state.notification.notifications)
    const colorScheme = useColorScheme()
    const router = useRouter()
    const authUser = useSelector((state: RootState) => state.user.user)
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const handleDeleteAll = async () => {
        setDeleteModalVisible(false);
        // Delete all notifications
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('user_id', authUser.id);
        if (error) {
            ToastAndroid.show('Error deleting notifications', ToastAndroid.SHORT);
        }
        dispatch(clearNotifications());
        ToastAndroid.show('Notifications deleted successfully!', ToastAndroid.SHORT);
    }
    const renderNotification = ({ item }: { item: any }) => (
        <TouchableOpacity onPress={() => router.push(item.data.url)}>
            <ThemedView style={styles.notificationCard}>
                <ThemedView style={styles.notificationContent}>
                    <ThemedText style={styles.notificationTitle}>{item.title}</ThemedText>
                    <ThemedText style={styles.notificationBody}>{item.body}</ThemedText>
                </ThemedView>
                <Ionicons name="arrow-forward" size={30} color={colorScheme === 'dark' ? 'white' : 'black'}
                    onPress={() => setDeleteModalVisible(true)}
                />
            </ThemedView>
        </TouchableOpacity>
    )

    return (
        <ScreenWrapper>
            <ThemedView style={styles.container}>
                <Header name="Notifications" right={notifications.length > 0 && <Ionicons name="trash" size={24} color={"red"}
                    onPress={() => {
                        setDeleteModalVisible(true);
                    }}
                />} />
                {notifications.length === 0 ? (
                    <ThemedText style={styles.emptyText}>You have not recive any notification yet</ThemedText>
                ) : <FlatList
                    data={notifications}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                />}
            </ThemedView>
            <ActionModal
                title='Delete All Notification'
                message='Are you sure you want to delete All notification?'
                visible={deleteModalVisible}
                onCancel={() => setDeleteModalVisible(false)}
                onConfirm={handleDeleteAll}
            />
        </ScreenWrapper>
    )
}

export default NotificationScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: hp(1),
        gap: hp(2),
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    emptyText: {
        marginTop: hp(10),
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
    },
    listContainer: {
        gap: 12,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: wp(2),
        borderRadius: 8,
        borderColor: '#ccc',
        borderWidth: 1,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: wp(5),
        fontWeight: 'bold',
        marginBottom: hp(.5),
    },
    notificationBody: {
        fontSize: wp(3.5),
    },
})
