import {
    StyleSheet,
    TextInput,
    FlatList,
    View,
    TouchableOpacity,
    ActivityIndicator,
    ToastAndroid,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { ThemedText } from '@/components/ThemedText';
import { supabase } from '@/lib/supabase';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { theme } from '@/constants/theme';
import { wp } from '@/helpers/common';
import { createNotificationInDB, sendPushNotification } from '@/utils/notification';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { addMember } from '@/features/khata/membersSclice';

type User = {
    id: string;
    full_name: string;
    avatar?: string | null;
    username: string;
    expo_push_token: string
};

type Invite = {
    invited_to_id: string;
};

type LocalSearchParams = {
    khata_id?: string;
};

const InviteMember = () => {
    const { khata_id } = useLocalSearchParams<LocalSearchParams>();
    const [search, setSearch] = useState<string>('');
    const [users, setUsers] = useState<User[]>([]);
    const [invitingUserId, setInvitingUserId] = useState<string | null>(null);
    const [invitedUserIds, setInvitedUserIds] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const authUser = useSelector((state: RootState) => state.user.user)
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        const fetchUsers = async () => {
            if (search.trim() === '') {
                setUsers([]);
                return;
            }

            setLoading(true);

            const { data, error } = await supabase
                .from('users')
                .select('id, full_name, avatar,username,expo_push_token')
                .ilike('username', `%${search}%`)
                .neq('id', (await supabase.auth.getUser()).data.user?.id);

            if (!error && data) setUsers(data as User[]);
            setLoading(false);
        };

        const fetchInvited = async () => {
            const { data, error } = await supabase
                .from('invites')
                .select('invited_to_id')
                .eq('khata_id', khata_id);

            if (!error && data) {
                setInvitedUserIds((data as Invite[]).map((invite) => invite.invited_to_id));
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
            fetchInvited();
        }, 300); // debounce

        return () => clearTimeout(delayDebounceFn);
    }, [search, khata_id]);

    const handleInvite = async (userId: string, expo_push_token: string, full_name: string) => {
        setInvitingUserId(userId);
        const invited_by_id = (await supabase.auth.getUser()).data.user?.id;

        const { data, error } = await supabase.from('invites').insert([
            {
                invited_to_id: userId,
                khata_id,
                invited_by_id,
            },
        ])
            .select("id,khata:khata_id(name)")

        if (!error) {
            setInvitedUserIds((prev) => [...prev, userId]);
        } else {
            console.log(error);
            ToastAndroid.show('Error inviting user', ToastAndroid.SHORT);
        }
        if (data && data[0]?.khata) {
            dispatch(addMember({ khata_id: data[0]?.khata.id, member: { id: userId, full_name, avatar: authUser?.avatar, isAccepted: false } }))
            createNotificationInDB(
                `${authUser?.full_name} invited you to join ${data[0].khata?.name}`,
                `Hey ${full_name} have been invited to join ${data[0]?.khata.name} by ${authUser?.full_name}`,
                { url: `/accept_invite/${data[0]?.id}` },
                userId,
                'invite'
            )
            sendPushNotification({
                to: expo_push_token,
                title: `${authUser?.full_name} invited you to join ${data[0]?.khata.name}`,
                body: `Hey ${full_name} have been invited to join ${data[0]?.khata.name} by ${authUser?.full_name}`,
                data: {
                    url: `/accept_invite/${data[0]?.id}`,
                },
                sound: 'default'
            })
        }
        setInvitingUserId(null);
    };

    return (
        <ScreenWrapper>
            <ThemedView style={styles.container}>
                {/* back button */}
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back-outline" size={30} color="white" />
                    </TouchableOpacity>
                    <ThemedView style={styles.searchContainer}>
                        <Ionicons name="search-outline" size={24} color="white" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search users..."
                            placeholderTextColor="#999"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </ThemedView>
                </ThemedView>
                {loading ? (
                    <ActivityIndicator size="large" color="#666" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={users}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => {
                            const isInvited = invitedUserIds.includes(item.id);
                            return (
                                <ThemedView style={styles.userItem}>
                                    <ThemedView style={styles.avatarPlaceholder}>
                                        {item.avatar ? <Image source={{ uri: item.avatar }} style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 20
                                        }} /> : <ThemedText style={styles.avatarText}>{item.full_name[0]}</ThemedText>}
                                        <ThemedView style={{
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'flex-start',
                                            marginLeft: 10,
                                        }}>
                                            <ThemedText style={styles.username}>{item.username}</ThemedText>
                                            <ThemedText style={styles.fullName}>{item.full_name}</ThemedText>
                                        </ThemedView>
                                    </ThemedView>
                                    <TouchableOpacity
                                        style={[styles.inviteButton, isInvited && styles.invitedButton]}
                                        onPress={() => !isInvited && handleInvite(item.id, item.expo_push_token, item.full_name)}
                                        disabled={isInvited || invitingUserId === item.id}
                                    >
                                        {isInvited ? (
                                            <Ionicons name="checkmark-done-outline" size={20} color="white" />
                                        ) : (
                                            <Ionicons name="person-add-outline" size={20} color="white" />
                                        )}
                                        <ThemedText style={styles.inviteButtonText}>
                                            {isInvited
                                                ? 'Invited'
                                                : invitingUserId === item.id
                                                    ? 'Inviting...'
                                                    : 'Invite'}
                                        </ThemedText>
                                    </TouchableOpacity>
                                </ThemedView>
                            );
                        }}
                        ListEmptyComponent={
                            !loading && search.length > 0 ? (
                                <ThemedText style={{ textAlign: 'center', marginTop: 20 }}>
                                    No users found
                                </ThemedText>
                            ) : null
                        }
                    />
                )}
            </ThemedView>
        </ScreenWrapper>
    );
};

export default InviteMember;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    backButton: {
        marginRight: 10,
    },
    searchContainer: {
        flex: 1,
        paddingVertical: wp(3),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "flex-start",
        paddingHorizontal: 10,
        backgroundColor: theme.colors.dark,
        borderRadius: 20
    },
    searchInput: {
        fontSize: wp(5),
        color: 'white',
        flex: 1,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,

    },
    avatarPlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    username: {
        fontSize: wp(5),
        fontWeight: 'bold',
    },
    fullName: {
        fontSize: wp(4),
        color: '#666',
        fontWeight: "500"
    },
    inviteButton: {
        backgroundColor: '#0095f6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    invitedButton: {
        backgroundColor: '#4CAF50',
    },
    inviteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    avatarText: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ccc',
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        textAlignVertical: 'center',
    },
});
