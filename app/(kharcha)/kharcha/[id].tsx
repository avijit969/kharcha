import {
    StyleSheet,
    FlatList,
    ActivityIndicator,
    View,
    ToastAndroid,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { addKharcha, removeKharcha, setKharcha } from '@/features/kharcha/kharchaSlice';
import { theme } from '@/constants/theme';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import AddKrachaBS from '@/components/AddKrachaBS';
import Header from '@/components/Header';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import ActionModal from '@/components/ActionModal';
import { RealtimeMessage } from '@supabase/supabase-js';

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
    const themeMode = useColorScheme();
    const isDark = themeMode === 'dark';
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [operationType, setOperationType] = useState<"add" | "edit">("add");
    const [selectedKharcha, setSelectedKharcha] = useState<Kharcha>();
    const khata = useSelector((state: RootState) =>
        state.khata.find((item) => item.id === id)
    );
    const router = useRouter();

    const openEditModal = (kharchaData: Kharcha) => {
        setSelectedKharcha(kharchaData);
        setOperationType("edit");
        bottomSheetModalRef.current?.present();
    };
    // sort kharcha by created_at
    const kharchaList = useSelector((state: RootState) => state.kharcha.kharcha);
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);
    const handledeleteKharcha = async (id: string) => {
        const { error } = await supabase
            .from('kharcha')
            .delete()
            .eq('id', selectedKharcha?.id);
        if (error) {
            ToastAndroid.show(error.message, ToastAndroid.SHORT);
        }
        dispatch(removeKharcha({ id }));
        setDeleteModalVisible(false);
        ToastAndroid.show('Kharcha deleted successfully!', ToastAndroid.SHORT);
    };

    const renderItem = ({ item }: { item: Kharcha }) => (
        <ThemedView style={[styles.card]}>
            <ThemedView style={styles.cardRow}>
                <ThemedView style={styles.rowLeft}>
                    <Ionicons
                        name="wallet-outline"
                        size={20}
                        color={isDark ? '#4facfe' : '#007aff'}
                    />
                    <ThemedText style={styles.cardTitle}>{item.name}</ThemedText>
                </ThemedView>

                <ThemedView style={styles.rowRight}>
                    <Ionicons name="cash-outline" size={18} color="#28a745" />
                    <ThemedText style={styles.amount}>
                        ₹ {new Intl.NumberFormat('en-IN').format(item.amount)}
                    </ThemedText>
                    {/* Delete Button icon */}
                    <Ionicons
                        name="trash-outline"
                        size={18}
                        color={"red"}
                        onPress={() => {
                            setDeleteModalVisible(true);
                            setSelectedKharcha(item);
                        }}
                        style={{ marginLeft: 10 }}
                    />
                </ThemedView>
            </ThemedView>

            {item.description && item.description.length > 0 && (
                <ThemedView style={styles.cardRow}>
                    <ThemedView style={styles.rowLeft}>
                        <Ionicons
                            name="information-circle-outline"
                            size={16}
                            color={isDark ? '#aaa' : '#777'}
                        />
                        <ThemedText style={styles.description}>{item.description}</ThemedText>
                    </ThemedView>
                </ThemedView>
            )}
            <ThemedView style={styles.cardRow}>
                <ThemedView style={styles.rowLeft}>
                    <Ionicons name="pricetag-outline" size={16} color={isDark ? '#ccc' : '#666'} />
                    <ThemedText style={[styles.type, { color: isDark ? '#ccc' : '#666' }]}>
                        {item.type}
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.rowRight}>
                    {item.users.avatar ? <Image source={{ uri: item.users.avatar }} style={{ width: 24, height: 24, borderRadius: 12 }} /> :
                        <Ionicons
                            name="person-circle-outline"
                            size={18}
                            color={isDark ? '#ccc' : '#666'}
                        />}
                    <ThemedText style={{ fontSize: 13, color: isDark ? '#ccc' : '#555' }}>
                        Paid By {item.users.full_name}
                    </ThemedText>
                    {/* Edit Button icon */}
                    <Ionicons
                        name="create-outline"
                        size={18}
                        color={"#007aff"}
                        onPress={() => openEditModal(item)}
                        style={{ marginLeft: 10 }}
                    />
                </ThemedView>
                <ThemedText style={{ fontSize: 13, color: isDark ? '#ccc' : '#555' }}>
                    {item.created_at}
                </ThemedText>
            </ThemedView>
        </ThemedView>
    );

    return (
        <ScreenWrapper>
            <ThemedView style={{ flex: 1, paddingBottom: 20 }}>
                <StatusBar style="dark" />
                <Header name={"All Kharcha"} right={
                    <Ionicons
                        name="bar-chart-outline"
                        size={24}
                        color={isDark ? '#f5f5f5' : '#1e1e1e'}
                        onPress={() => {
                            router.push(`/dashboard/${khata?.id}` as any);
                        }}
                        style={[{ marginRight: 10 }]}
                    />
                } />
                <ThemedView style={styles.container}>
                    <ThemedText
                        style={[
                            styles.heading,
                            { color: isDark ? '#f5f5f5' : '#1e1e1e' },
                        ]}
                    >
                        💰 {khata?.name}
                    </ThemedText>
                    <FlatList
                        data={kharchaList}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <ThemedText
                                style={{
                                    textAlign: 'center',
                                    fontSize: 16,
                                    color: isDark ? '#aaa' : '#555',
                                }}
                            >
                                No kharcha found for this khata.
                            </ThemedText>
                        )}
                    />
                </ThemedView>
                <Button
                    title="Add New Kharcha"
                    onPress={() => {
                        handlePresentModalPress();
                    }}
                    style={{
                        paddingVertical: 14,
                        borderRadius: 12,
                        backgroundColor: isDark ? '#4facfe' : '#007aff',
                        marginHorizontal: 20,
                    }}
                />

            </ThemedView>
            <AddKrachaBS
                bottomSheetModalRef={bottomSheetModalRef}
                khataId={id}
                operationType={operationType}
                data={selectedKharcha}
                khataName={khata?.name}
            />
            <ActionModal
                visible={deleteModalVisible}
                title="Delete Kharcha"
                message="Are you sure you want to delete this kharcha?"
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={() => {
                    if (!selectedKharcha) return;
                    handledeleteKharcha(selectedKharcha.id);
                    setDeleteModalVisible(false);
                }}
                onCancel={() => {
                    setDeleteModalVisible(false);
                }}
            />
        </ScreenWrapper>
    );
};

export default All_kharcha;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp(1),
        paddingTop: hp(2),
    },
    heading: {
        fontSize: wp(6.2),
        fontWeight: 'bold',
        paddingBottom: 14,
    },
    listContent: {
        paddingBottom: 80,
    },
    card: {
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 0.5,
        borderColor: '#ddd',
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 1,
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        color: '#888',
        flexWrap: 'wrap',
        flexShrink: 1,
    },
    amount: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#28a745',
    },
    type: {
        fontSize: 13,
        textTransform: 'capitalize',
    },
});
