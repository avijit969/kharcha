import { StyleSheet, FlatList, TouchableOpacity, View, ToastAndroid } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { useColorScheme } from '@/hooks/useColorScheme.web' // Ensure consistent hook import
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Header from '@/components/Header'
import { hp, wp } from '@/helpers/common'
import ActionModal from '@/components/ActionModal'
import { supabase } from '@/lib/supabase'
import { clearNotifications } from '@/features/notification/notificationSclice'
import { theme } from '@/constants/theme'
import { StatusBar } from 'expo-status-bar'

const NotificationScreen = () => {
    const notifications = useSelector((state: RootState) => state.notification.notifications)
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'
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
        } else {
            dispatch(clearNotifications());
            ToastAndroid.show('All notifications cleared!', ToastAndroid.SHORT);
        }
    }

    const renderNotification = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => item.data?.url && router.push(item.data.url)}
            activeOpacity={0.7}
        >
            <ThemedView style={[styles.notificationCard, {
                backgroundColor: isDark ? '#1e1e1e' : '#fff',
                borderColor: isDark ? '#333' : '#eee',
            }]}>
                <View style={[styles.iconContainer, { backgroundColor: isDark ? '#333' : '#eef2ff' }]}>
                    <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.notificationContent}>
                    <ThemedText style={styles.notificationTitle}>{item.title}</ThemedText>
                    <ThemedText style={[styles.notificationBody, { color: isDark ? '#aaa' : '#666' }]}>
                        {item.body}
                    </ThemedText>
                </View>
                {/* Optional: Add timestamp or chevron */}
                {/* <ionic name="chevron-forward" ... /> */}
            </ThemedView>
        </TouchableOpacity>
    )

    return (
        <ScreenWrapper>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <ThemedView style={styles.container}>
                <Header name="Notifications" right={
                    notifications.length > 0 &&
                    <TouchableOpacity onPress={() => setDeleteModalVisible(true)} style={styles.clearBtn}>
                        <Ionicons name="trash-outline" size={20} color={theme.colors.rose} />
                    </TouchableOpacity>
                } />

                {notifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={60} color={isDark ? '#444' : '#ccc'} />
                        <ThemedText style={styles.emptyText}>No Notifications</ThemedText>
                        <ThemedText style={styles.emptySubText}>
                            You're all caught up!
                        </ThemedText>
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        renderItem={renderNotification}
                        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </ThemedView>
            <ActionModal
                title='Clear All'
                message='Are you sure you want to delete all notifications?'
                visible={deleteModalVisible}
                confirmText='Clear All'
                cancelText='Cancel'
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
        paddingHorizontal: wp(4),
    },
    listContainer: {
        gap: 12,
        paddingVertical: hp(2),
        paddingBottom: hp(5),
    },
    clearBtn: {
        padding: 8,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    notificationBody: {
        fontSize: 14,
        lineHeight: 20,
    },
    // Empty State
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -hp(10), // Lift visual center slightly
        gap: 10,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#888',
    },
    emptySubText: {
        fontSize: 14,
        color: '#aaa',
    },
})
