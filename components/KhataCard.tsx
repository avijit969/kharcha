import { StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ThemedView } from './ThemedView';
import { KhataData } from '@/app/(tabs)/home';
import { ThemedText } from './ThemedText';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { wp } from '@/helpers/common';
import { useDispatch, useSelector } from 'react-redux';
import { Member, setMembers } from '@/features/khata/membersSclice';
import { RootState } from '@/store/store';
import { useColorScheme } from '@/hooks/useColorScheme.web';

type Props = {
    data: KhataData;
};

const KhataCard: React.FC<Props> = ({ data }) => {
    const [membersCount, setMembersCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [KhataCreatedBy, setKhataCreatedBy] = useState<string | null>(null);
    const router = useRouter();
    const dispatch = useDispatch();
    const theme = useColorScheme();
    const khataMembersOfKhata = useSelector((state: RootState) => state.khata_members.khata_members).filter(k => k.khata_id === data.id);
    const getMembers = async () => {
        const { data: khataMembers, error } = await supabase
            .from('members')
            .select('id, khata_id,role, users(id, full_name, avatar)')
            .eq('khata_id', data.id);

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        if (khataMembers && khataMembers.length > 0) {
            const formattedMembers: Member[] = khataMembers.map((item: any) => ({
                id: item.users.id,
                full_name: item.users.full_name,
                avatar: item.users.avatar,
                role: item.role,
            }));

            dispatch(
                setMembers({
                    khata_id: khataMembers[0].khata_id,
                    members: formattedMembers,
                })
            );
            setMembersCount(formattedMembers.length);
        }

        setLoading(false);
    };
    const getKhataDetials = async (id: string) => {
        const { data, error } = await supabase
            .from('khata')
            .select('id, name,users(id, full_name, avatar)')
            .eq('id', id)
            .single();
        if (error) {
            setError(error.message);
            return;
        }
        console.log(data);
        if (data.users) {
            setKhataCreatedBy(data.users.full_name);
            return;
        }
    }

    useEffect(() => {
        getKhataDetials(data.id as string);
        getMembers();
    }, []);

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/khataDetails/${data.id}`)}
        >
            <ThemedView style={styles.card}>
                <ThemedText style={styles.title}>{data.name}</ThemedText>

                <Image
                    source={{ uri: data.cover_image }}
                    style={styles.coverImage}
                    contentFit="cover"
                    transition={1000}
                />

                <ThemedView style={styles.infoRow}>
                    <ThemedView style={styles.iconRow}>
                        <Ionicons name="person-circle-outline" size={24} color={theme === 'dark' ? 'white' : 'black'} />
                        <ThemedText style={styles.infoText}>
                            {loading ? 'Loading...' : `${membersCount} members`}
                        </ThemedText>
                    </ThemedView>

                    <ThemedView>
                        <ThemedView style={styles.iconRow}>
                            <Ionicons name="calendar-outline" size={15} color={theme === 'dark' ? 'white' : 'black'} />
                            <ThemedText style={styles.infoText}>
                                {new Date(data.created_at).toLocaleDateString()}
                            </ThemedText>
                        </ThemedView>

                        <ThemedView style={styles.iconRow}>
                            <Ionicons name="create" size={15} color={theme === 'dark' ? 'white' : 'black'} />
                            <ThemedText style={styles.infoText}>
                                {KhataCreatedBy}
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>
                </ThemedView>
            </ThemedView>
        </TouchableOpacity>
    );
};

export default KhataCard;

const styles = StyleSheet.create({
    card: {
        padding: 12,
        borderRadius: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        shadowColor: '#000',
        elevation: 2,
        marginVertical: 6,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    coverImage: {
        width: '100%',
        height: 180,
        borderRadius: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        marginTop: 10,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 4,
    },
    infoText: {
        fontSize: wp(4),
        fontWeight: 'bold',
    },
});
