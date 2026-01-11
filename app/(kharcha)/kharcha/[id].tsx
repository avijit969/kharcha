import {
    StyleSheet,
    FlatList,
    View,
    ToastAndroid,
    TouchableOpacity,
    Modal,
    Text
} from 'react-native';
import React, { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ScreenWrapper from '@/components/ScreenWrapper';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import Button from '@/components/Button';

import { useColorScheme } from '@/hooks/useColorScheme.web';
import { hp, wp } from '@/helpers/common';
import { supabase } from '@/lib/supabase';

import { RootState } from '@/store/store';
import { removeKharcha } from '@/features/kharcha/kharchaSlice';
import { theme } from '@/constants/theme';
import Header from '@/components/Header';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import ActionModal from '@/components/ActionModal';
import AddEditKharchaModal from '@/components/AddEditKharchaModal';

export type Kharcha = {
    id: string;
    name: string;
    description?: string;
    amount: number;
    type: string;
    created_at?: string | null;
    updated_at?: string | null;
    created_by: string;
    khata_id: string;
    payment_mode: string;
    users: {
        full_name: string;
        avatar?: string;
    };
};

const All_kharcha = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const dispatch = useDispatch();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Modal & Selection State
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [addEditModalVisible, setAddEditModalVisible] = useState(false);
    const [selectedKharcha, setSelectedKharcha] = useState<Kharcha | undefined>(undefined);

    const khata = useSelector((state: RootState) =>
        state.khata.find((item) => item.id === id)
    );
    const router = useRouter();

    const openEditModal = (kharchaData: Kharcha) => {
        setSelectedKharcha(kharchaData);
        setAddEditModalVisible(true);
    };

    const kharchaList = useSelector((state: RootState) => state.kharcha.kharcha);

    const handlePresentModalPress = useCallback(() => {
        setSelectedKharcha(undefined);
        setAddEditModalVisible(true);
    }, []);

    const handledeleteKharcha = async (id: string) => {
        const { error } = await supabase
            .from('kharcha')
            .delete()
            .eq('id', selectedKharcha?.id || '');
        if (error) {
            ToastAndroid.show(error.message, ToastAndroid.SHORT);
        }
        dispatch(removeKharcha({ id }));
        setDeleteModalVisible(false);
        ToastAndroid.show('Kharcha deleted successfully!', ToastAndroid.SHORT);
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderItem = ({ item }: { item: Kharcha }) => (
        <ThemedView style={[styles.card, {
            backgroundColor: isDark ? '#1e1e1e' : '#fff',
            borderColor: isDark ? '#333' : '#eee',
        }]}>
            {/* Header: Name, Actions, Amount */}
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: isDark ? '#333' : '#f0f9ff' }]}>
                        <Ionicons
                            name="wallet"
                            size={20}
                            color={theme.colors.primary}
                        />
                    </View>
                    <View>
                        <ThemedText style={styles.cardTitle}>{item.name}</ThemedText>
                        <ThemedText style={[styles.paymentMode, { color: isDark ? '#aaa' : '#666' }]}>
                            {item.payment_mode || 'Cash'} • {item.type}
                        </ThemedText>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <ThemedText style={styles.amount}>
                        ₹{new Intl.NumberFormat('en-IN').format(item.amount)}
                    </ThemedText>
                </View>
            </View>

            {/* Description Body */}
            {item.description ? (
                <View style={styles.descriptionContainer}>
                    <ThemedText style={[styles.description, { color: isDark ? '#ccc' : '#555' }]} numberOfLines={2}>
                        {item.description}
                    </ThemedText>
                </View>
            ) : null}

            <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]} />

            {/* Footer: User & Date & Actions */}
            <View style={styles.cardFooter}>
                <View style={styles.footerUser}>
                    {item.users.avatar ? (
                        <Image source={{ uri: item.users.avatar }} style={styles.avatar} />
                    ) : (
                        <Ionicons name="person-circle" size={24} color={isDark ? '#ccc' : '#888'} />
                    )}
                    <View>
                        <ThemedText style={[styles.footerText, { color: isDark ? '#ccc' : '#444', fontWeight: '500' }]}>
                            {item.users.full_name?.split(' ')[0]}
                        </ThemedText>
                        <ThemedText style={[styles.footerSubText, { color: isDark ? '#888' : '#999' }]}>
                            {formatDate(item.created_at)}
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        onPress={() => openEditModal(item)}
                        style={[styles.actionBtn, { backgroundColor: isDark ? '#334' : '#eef2ff' }]}
                    >
                        <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setSelectedKharcha(item);
                            setDeleteModalVisible(true);
                        }}
                        style={[styles.actionBtn, { backgroundColor: isDark ? '#322' : '#fff1f2' }]}
                    >
                        <Ionicons name="trash-outline" size={18} color={theme.colors.rose} />
                    </TouchableOpacity>
                </View>
            </View>
        </ThemedView>
    );

    return (
        <ScreenWrapper>
            <ThemedView style={{ flex: 1 }}>
                <StatusBar style={isDark ? "light" : "dark"} />
                <Header name={"All Kharcha"} right={
                    <Ionicons
                        name="bar-chart-outline"
                        size={24}
                        color={isDark ? '#f5f5f5' : '#1e1e1e'}
                        onPress={() => {
                            router.push(`/dashboard/${khata?.id}` as any);
                        }}
                    />
                } />

                <View style={styles.contentContainer}>
                    <View style={styles.pageHeader}>
                        <ThemedText style={styles.heading}>
                            {khata?.name}
                        </ThemedText>
                        <ThemedText style={{ color: isDark ? '#aaa' : '#666' }}>
                            track your expenses
                        </ThemedText>
                    </View>

                    <FlatList
                        data={kharchaList}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyState}>
                                <Ionicons name="receipt-outline" size={64} color={isDark ? '#333' : '#ddd'} />
                                <ThemedText style={styles.emptyText}>No kharcha records yet.</ThemedText>
                                <ThemedText style={styles.emptySubText}>Add one to get started!</ThemedText>
                            </View>
                        )}
                    />
                </View>

                <View style={[styles.fabContainer, { backgroundColor: isDark ? '#000' : '#fff' }]}>
                    <Button
                        title="Add New Kharcha"
                        onPress={handlePresentModalPress}
                        style={styles.addButton}
                        textStyle={{ fontWeight: 'bold' }}
                    />
                </View>

            </ThemedView>



            <ActionModal
                visible={deleteModalVisible}
                title="Delete Kharcha"
                message="Are you sure you want to delete this record?"
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={() => {
                    if (!selectedKharcha) return;
                    handledeleteKharcha(selectedKharcha.id);
                }}
                onCancel={() => setDeleteModalVisible(false)}
            />
            <AddEditKharchaModal
                visible={addEditModalVisible}
                onClose={() => setAddEditModalVisible(false)}
                khataId={id}
                khataName={khata?.name}
                data={selectedKharcha as any}
            />
        </ScreenWrapper>
    );
};

export default All_kharcha;

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        paddingHorizontal: wp(4),
    },
    pageHeader: {
        marginVertical: hp(2),
    },
    heading: {
        fontSize: wp(7),
        fontWeight: 'bold',
        fontFamily: 'Inter_700Bold', // Usage implies font load, fallback safe
    },
    listContent: {
        paddingBottom: hp(12), // Space for floating bottom button
    },
    // Card Styles
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        // Elevation for Android
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        padding: 10,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    paymentMode: {
        fontSize: 12,
        textTransform: 'capitalize',
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary, // Using primary color for emphasis
    },
    descriptionContainer: {
        marginTop: 4,
        marginBottom: 8,
        paddingLeft: 4,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
    },
    divider: {
        height: 1,
        marginVertical: 10,
        width: '100%',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#eee',
    },
    footerText: {
        fontSize: 13,
    },
    footerSubText: {
        fontSize: 11,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        padding: 8,
        borderRadius: 8,
    },
    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: hp(5),
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
    // Bottom Action
    fabContainer: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
    },
    addButton: {
        width: '100%',
        height: hp(6),
    }
});
