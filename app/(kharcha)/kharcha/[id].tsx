import {
    StyleSheet,
    FlatList,
    ActivityIndicator,
    View,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ScreenWrapper from '@/components/ScreenWrapper';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import Button from '@/components/Button';

import { useColorScheme } from '@/hooks/useColorScheme.web';
import { hp, wp } from '@/helpers/common';
import { supabase } from '@/lib/supabase';

import { RootState } from '@/store/store';
import { setKharcha } from '@/features/kharcha/kharchaSlice';
import { theme } from '@/constants/theme';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import AddKrachaBS from '@/components/AddKrachaBS';
import Header from '@/components/Header';
import { StatusBar } from 'expo-status-bar';

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
    const [loading, setLoading] = useState(true);
    const themeMode = useColorScheme();
    const isDark = themeMode === 'dark';
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const khata = useSelector((state: RootState) =>
        state.khata.find((item) => item.id === id)
    );

    const kharchaList = useSelector((state: RootState) => state.kharcha.kharcha);
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);
    useEffect(() => {
        const findAllKharchaByKhataId = async () => {
            const { data, error } = await supabase
                .from('kharcha')
                .select('*, users(full_name, avatar)')
                .eq('khata_id', id);

            if (error) {
                console.error('Error fetching kharcha data:', error.message);
                return;
            }

            if (data) {
                dispatch(setKharcha(data));
            }

            setLoading(false);
        };

        findAllKharchaByKhataId();
    }, []);

    const renderItem = ({ item }: { item: Kharcha }) => (
        <ThemedView style={[styles.card, { backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
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
                    <Ionicons
                        name="person-circle-outline"
                        size={18}
                        color={isDark ? '#ccc' : '#666'}
                    />
                    <ThemedText style={{ fontSize: 13, color: isDark ? '#ccc' : '#555' }}>
                        Paid by {item.users.full_name}
                    </ThemedText>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    );

    return (
        <ScreenWrapper>
            <ThemedView style={{ flex: 1, paddingBottom: 20 }}>
                <StatusBar style="inverted" />
                <Header name={"All Kharcha"} />
                <ThemedView style={styles.container}>
                    <ThemedText
                        style={[
                            styles.heading,
                            { color: isDark ? '#f5f5f5' : '#1e1e1e' },
                        ]}
                    >
                        💰 {khata?.name}
                    </ThemedText>

                    {loading ? (
                        <ActivityIndicator size="large" color="#007aff" />
                    ) : (
                        <FlatList
                            data={kharchaList}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    )}

                    {!loading && kharchaList.length === 0 && (
                        <ThemedText
                            style={{
                                textAlign: 'center',
                                alignSelf: 'center',
                                fontSize: 16,
                                color: isDark ? '#aaa' : '#555',
                            }}
                        >
                            No kharcha found for this khata.
                        </ThemedText>
                    )}
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
            <AddKrachaBS bottomSheetModalRef={bottomSheetModalRef} khataId={id} />
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
