import { StyleSheet, View, TouchableOpacity, ToastAndroid, Modal, TouchableWithoutFeedback, Text, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { hp, wp } from '@/helpers/common'
import { Image } from 'expo-image'
import { theme as appTheme } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import Button from '@/components/Button'
import { useColorScheme } from '@/hooks/useColorScheme.web'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import { setKharcha } from '@/features/kharcha/kharchaSlice'
import { StatusBar } from 'expo-status-bar'
import { setMembers } from '@/features/khata/membersSclice'
import ActionModal from '@/components/ActionModal'
import { removeKhata } from '@/features/khata/khataSlice'
import EditKhataActionModal from '@/components/EditKhataActionModal'
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
import { LinearGradient } from 'expo-linear-gradient'

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const KhataDetailes = () => {
    const { id } = useLocalSearchParams()
    // Safe access to khata
    const khata = useSelector((state: RootState) => state.khata).find((item) => item.id === id) || {} as any;

    // Safe access to members and admin
    const khataMembersEntry = useSelector((state: RootState) => state.khata_members.khata_members.find((item) => item.khata_id === id));
    const khataCreatedBy = khataMembersEntry?.members?.find((item) => item.role === "admin");

    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'
    const dispatch = useDispatch()
    const router = useRouter()
    const kharcha = useSelector((state: RootState) => state.kharcha.kharcha)

    // Modals State
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showOptionsMenu, setShowOptionsMenu] = useState(false)
    const [showAddKharchaModal, setShowAddKharchaModal] = useState(false)
    const [selectedKharcha, setSelectedKharcha] = useState<any>(undefined);

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!id) return;
        const findAllKharchaByKhataId = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('kharcha')
                .select('*, users(full_name, avatar)')
                .eq('khata_id', id as string);

            if (error) {
                console.error("Error fetching kharcha:", error);
            }
            if (data) {
                dispatch(setKharcha(data as any));
            }
            setLoading(false);
        };

        findAllKharchaByKhataId();
    }, [id]);

    useEffect(() => {
        if (!id) return;
        const getAllMembersOfKhata = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('members')
                .select('*, users(id,full_name, avatar,expo_push_token)')
                .eq('khata_id', id as string)
            if (error) {
                ToastAndroid.show(error.message, ToastAndroid.SHORT);
            }
            if (data) {
                const formatedMembers = data.map((member: any) => ({
                    id: member.users.id,
                    full_name: member.users.full_name,
                    avatar: member.users.avatar,
                    role: member.role,
                    expo_push_token: member.users.expo_push_token
                }))
                dispatch(setMembers({ khata_id: id as string, members: formatedMembers }))
            }
            setLoading(false);
        }
        getAllMembersOfKhata()
    }, [id])

    const deleteKhata = async (id: string) => {
        function extractImagePath(url: string): string {
            const keyword = 'khata_cover_image';
            const index = url.indexOf(keyword);
            if (index === -1) return '';
            return url.substring(index);
        }

        if (khata?.cover_image) {
            const { error: storageError } = await supabase
                .storage
                .from('kharcha')
                .remove([extractImagePath(khata.cover_image as string)]);
            if (storageError) {
                ToastAndroid.show(storageError.message, ToastAndroid.SHORT);
            }
        }

        const { error } = await supabase
            .from('khata')
            .delete()
            .eq('id', id);

        if (error) {
            ToastAndroid.show(error.message, ToastAndroid.SHORT);
        } else {
            ToastAndroid.show('Khata deleted successfully!', ToastAndroid.SHORT);
            dispatch(removeKhata({ id: id as string }));
            router.back();
        }
    }

    const totalExpense = kharcha.map((item) => item.amount || 0).reduce((a, b) => a + b, 0).toFixed(2);

    return (
        <ScreenWrapper>
            <ThemedView style={{ flex: 1 }}>
                <StatusBar style={isDark ? "light" : "dark"} />
                <Header name={khata?.name || 'Khata Details'} right={
                    <View style={{ position: 'relative' }}>
                        <TouchableOpacity onPress={() => setShowOptionsMenu(true)} style={styles.headerIconBtn}>
                            <Ionicons name="ellipsis-vertical" size={24} color={isDark ? '#fff' : '#333'} />
                        </TouchableOpacity>
                    </View>
                } />

                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Cover Image Section */}
                    {loading ? (
                        <View style={styles.imageContainer}>
                            <ShimmerPlaceholder style={styles.coverImage} />
                        </View>
                    ) : (
                        <View style={styles.imageContainer}>
                            <Image
                                source={khata?.cover_image ? { uri: khata.cover_image } : require('@/assets/images/icon.png')}
                                style={styles.coverImage}
                                contentFit="cover"
                                transition={500}
                            />
                        </View>
                    )}

                    {/* Stats Summary Card */}
                    <View style={[styles.statsCard, {
                        backgroundColor: isDark ? '#1e1e1e' : '#fff',
                        borderColor: isDark ? '#333' : '#eee'
                    }]}>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statLabel}>Total Expense</ThemedText>
                            <ThemedText style={[styles.statValue, { color: appTheme.colors.primary }]}>
                                ₹ {new Intl.NumberFormat('en-IN').format(parseFloat(totalExpense))}
                            </ThemedText>
                        </View>
                        <View style={[styles.verticalDivider, { backgroundColor: isDark ? '#333' : '#eee' }]} />
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statLabel}>Members</ThemedText>
                            <TouchableOpacity
                                onPress={() => router.push(`/(khata)/members/${id}` as any)}
                                style={styles.membersLink}
                            >
                                <ThemedText style={[styles.statValue, { fontSize: 18 }]}>View</ThemedText>
                                <Ionicons name="chevron-forward" size={16} color={isDark ? '#aaa' : '#666'} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Details Section */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>About</ThemedText>
                        <ThemedText style={[styles.description, { color: isDark ? '#ccc' : '#555' }]}>
                            {khata?.description || "No description provided."}
                        </ThemedText>

                        <View style={[styles.infoRow, { backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9' }]}>
                            <View style={styles.creatorInfo}>
                                {khataCreatedBy?.avatar ? (
                                    <Image source={{ uri: khataCreatedBy.avatar }} style={styles.avatar} />
                                ) : (
                                    <Ionicons name="person-circle-outline" size={32} color={isDark ? '#aaa' : '#666'} />
                                )}
                                <View>
                                    <ThemedText style={styles.infoLabel}>Created by</ThemedText>
                                    <ThemedText style={styles.creatorName}>{khataCreatedBy?.full_name || 'Unknown'}</ThemedText>
                                </View>
                            </View>
                        </View>
                    </View>

                </ScrollView>

                {/* Bottom Action Area */}
                <View style={[styles.bottomActions, {
                    backgroundColor: isDark ? '#000' : '#fff',
                    borderTopColor: isDark ? '#222' : '#eee'
                }]}>
                    <Button
                        title="View Kharcha"
                        onPress={() => {
                            router.push(`/(kharcha)/kharcha/${khata?.id}` as any)
                        }}
                        style={styles.mainButton}
                        textStyle={{ fontWeight: 'bold' }}
                    />
                    <TouchableOpacity
                        style={[styles.secondaryButton, { borderColor: isDark ? '#444' : '#ddd' }]}
                        onPress={() => router.push(`/(kharcha)/kharcha/${khata?.id}` as any)}
                    >
                        <Ionicons name="receipt-outline" size={24} color={isDark ? '#ccc' : '#666'} />
                    </TouchableOpacity>
                </View>
            </ThemedView>

            {/* Custom Options Menu Modal */}
            <Modal
                transparent={true}
                visible={showOptionsMenu}
                animationType="fade"
                onRequestClose={() => setShowOptionsMenu(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowOptionsMenu(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.menuContainer, { backgroundColor: isDark ? '#333' : '#fff' }]}>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => { setShowOptionsMenu(false); setShowEditModal(true); }}
                            >
                                <Ionicons name="create-outline" size={20} color={isDark ? '#eee' : '#333'} />
                                <Text style={[styles.menuText, { color: isDark ? '#eee' : '#333' }]}>Edit Details</Text>
                            </TouchableOpacity>
                            <View style={[styles.menuSeparator, { backgroundColor: isDark ? '#555' : '#eee' }]} />
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => { setShowOptionsMenu(false); setShowDeleteModal(true); }}
                            >
                                <Ionicons name="trash-outline" size={20} color={appTheme.colors.rose} />
                                <Text style={[styles.menuText, { color: appTheme.colors.rose }]}>Delete Khata</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            <ActionModal title='Delete Khata' message='Are you sure you want to delete this khata completely?' visible={showDeleteModal} onConfirm={() => deleteKhata(id as string)} onCancel={() => setShowDeleteModal(false)} confirmText='Delete' />
            <EditKhataActionModal visible={showEditModal} khataDetails={khata as any} onClose={() => setShowEditModal(false)} />
        </ScreenWrapper >
    )
}

export default KhataDetailes

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: hp(12),
        paddingHorizontal: wp(4),
    },
    headerIconBtn: {
        padding: 5,
    },
    // Image
    imageContainer: {
        width: '100%',
        height: hp(28),
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: hp(1),
        marginBottom: hp(2),
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        backgroundColor: '#f0f0f0',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    // Stats Card
    statsCard: {
        flexDirection: 'row',
        borderRadius: 16,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: hp(2),
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verticalDivider: {
        width: 1,
        height: '80%',
        marginHorizontal: 10,
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    membersLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    // Section Styles
    section: {
        marginBottom: hp(2),
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 10,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 12,
    },
    creatorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: '#888',
    },
    creatorName: {
        fontSize: 15,
        fontWeight: '600',
    },
    // Bottom Actions
    bottomActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
    },
    mainButton: {
        borderRadius: 14,
        paddingVertical: 14,
        flex: 1
    },
    secondaryButton: {
        width: 52,
        height: 52,
        borderRadius: 14,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: hp(6),
        paddingRight: wp(5),
    },
    menuContainer: {
        borderRadius: 12,
        paddingVertical: 8,
        minWidth: 180,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 12,
    },
    menuText: {
        fontSize: 15,
        fontWeight: '500',
    },
    menuSeparator: {
        height: 1,
        width: '100%',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
})
