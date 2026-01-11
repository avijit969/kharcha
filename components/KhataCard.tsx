import { StyleSheet, TouchableOpacity, View } from 'react-native';
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
import { LinearGradient } from 'expo-linear-gradient';
import { theme as AppTheme } from '@/constants/theme';

type Props = {
    data: KhataData;
};

const KhataCard: React.FC<Props> = ({ data }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [KhataCreatedBy, setKhataCreatedBy] = useState<string | null>(null);
    const router = useRouter();
    const dispatch = useDispatch();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Get members from Redux if available, or they will be populated by fetch
    const khataMembersOfKhata = useSelector((state: RootState) => state.khata_members.khata_members).find(k => k.khata_id === data.id.toString())?.members || [];

    const getMembers = async () => {
        // Optimisation: If we already have members in redux for this khata, maybe don't fetch? 
        // For now, keeping original logic to ensure freshness, but could be optimised.

        const { data: khataMembers, error } = await supabase
            .from('members')
            .select('id, khata_id, role, users(id, full_name, avatar)')
            .eq('khata_id', data.id.toString());

        if (error) {
            console.error("Error fetching members:", error);
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
                    khata_id: khataMembers[0].khata_id as string,
                    members: formattedMembers,
                })
            );
        }
        setLoading(false);
    };

    const getKhataDetails = async (id: string) => {
        const { data, error } = await supabase
            .from('khata')
            .select('id, name, users(id, full_name, avatar)')
            .eq('id', id)
            .single();

        if (error) {
            console.error(error);
            return;
        }
        if (data.users) {
            setKhataCreatedBy(data.users.full_name);
        }
    }

    useEffect(() => {
        getKhataDetails(data.id as string);
        getMembers();
    }, []);

    // Derived state for display
    const visibleMembers = khataMembersOfKhata.slice(0, 4);
    const extraMembers = khataMembersOfKhata.length > 4 ? khataMembersOfKhata.length - 4 : 0;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(`/khataDetails/${data.id}`)}
        >
            <ThemedView style={[styles.card, {
                backgroundColor: isDark ? '#1e1e1e' : '#fff',
                borderColor: isDark ? '#333' : 'transparent',
                borderWidth: isDark ? 1 : 0
            }]}>
                {/* Hero Image Section */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: data.cover_image }}
                        style={styles.coverImage}
                        contentFit="cover"
                        transition={500}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.gradientOverlay}
                    >
                        <ThemedText style={styles.title} numberOfLines={1}>{data.name}</ThemedText>
                        <ThemedText style={styles.subtitle} numberOfLines={1}>
                            Created by {KhataCreatedBy || 'Unknown'}
                        </ThemedText>
                    </LinearGradient>
                </View>

                {/* Content Section */}
                <View style={styles.contentContainer}>
                    {/* Members Stack */}
                    <View style={styles.membersRow}>
                        <View style={styles.avatarStack}>
                            {visibleMembers.map((member, index) => (
                                <View key={member.id || index} style={[
                                    styles.avatarWrapper,
                                    { zIndex: 10 - index, marginLeft: index === 0 ? 0 : -12 }
                                ]}>
                                    <Image
                                        source={member.avatar ? { uri: member.avatar } : require('@/assets/images/icon.png')}
                                        style={styles.avatar}
                                    />
                                </View>
                            ))}
                            {extraMembers > 0 && (
                                <View style={[styles.avatarWrapper, styles.extraCountBadge, { zIndex: 0, marginLeft: -12 }]}>
                                    <ThemedText style={styles.extraCountText}>+{extraMembers}</ThemedText>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Date/Stats */}
                    <View style={styles.metaInfo}>
                        <Ionicons name="calendar-outline" size={14} color={isDark ? '#aaa' : '#666'} />
                        <ThemedText style={[styles.dateText, { color: isDark ? '#aaa' : '#666' }]}>
                            {new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </ThemedText>
                    </View>
                </View>
            </ThemedView>
        </TouchableOpacity>
    );
};

export default KhataCard;

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        // Elevation for Android
        elevation: 4,
        marginVertical: 6,
    },
    imageContainer: {
        height: 180,
        width: '100%',
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100, // Gradient height
        justifyContent: 'flex-end',
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    contentContainer: {
        padding: 16,
        paddingTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    membersRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarStack: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#fff', // Or dynamic based on theme, handled in wrapper style if needed
        overflow: 'hidden',
        backgroundColor: '#eee',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    extraCountBadge: {
        backgroundColor: AppTheme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    extraCountText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    metaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    dateText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
