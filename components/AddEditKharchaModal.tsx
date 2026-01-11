import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Modal,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ToastAndroid,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme.web';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { addKharcha, updateKharcha } from '@/features/kharcha/kharchaSlice';
import { supabase } from '@/lib/supabase';
import { Kharcha } from '@/app/(kharcha)/kharcha/[id]';
import { createNotificationInDB, sendPushNotification } from '@/utils/notification';
import { Member } from '@/features/khata/membersSclice';

interface AddEditKharchaModalProps {
    visible: boolean;
    onClose: () => void;
    khataId: string;
    khataName?: string;
    data?: Kharcha; // If provided, we are in Edit mode
}

const CATEGORIES = [
    { label: 'Food', icon: 'fast-food-outline', value: 'food', color: '#FF6B6B' },
    { label: 'Transport', icon: 'bus-outline', value: 'transport', color: '#4ECDC4' },
    { label: 'Shopping', icon: 'cart-outline', value: 'shopping', color: '#45B7D1' },
    { label: 'Health', icon: 'medkit-outline', value: 'healthcare', color: '#FF9F43' },
    { label: 'Utilities', icon: 'bulb-outline', value: 'utilities', color: '#F7B731' },
    { label: 'Entertainment', icon: 'film-outline', value: 'entertainment', color: '#A55EEA' },
    { label: 'Travel', icon: 'airplane-outline', value: 'travel', color: '#26de81' },
    { label: 'Fuel', icon: 'speedometer-outline', value: 'fuel', color: '#778ca3' },
    { label: 'Others', icon: 'grid-outline', value: 'others', color: '#d1d8e0' },
];

const PAYMENT_MODES = [
    { label: 'Cash', value: 'cash', icon: 'cash-outline' },
    { label: 'Online', value: 'online', icon: 'card-outline' },
    { label: 'Card', value: 'card', icon: 'wallet-outline' },
];

const AddEditKharchaModal: React.FC<AddEditKharchaModalProps> = ({
    visible,
    onClose,
    khataId,
    khataName,
    data
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const dispatch = useDispatch();

    // Form State
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(CATEGORIES[8].value); // Default 'others'
    const [paymentMode, setPaymentMode] = useState('cash');
    const [loading, setLoading] = useState(false);

    // Get Logged In User
    const user = useSelector((state: RootState) => state.user.user);
    // Get Khata Members for notifications
    const members = useSelector((state: RootState) => state.khata_members.khata_members)
        .find(m => m.khata_id === khataId)?.members || [];

    // Initialize or Reset Form
    useEffect(() => {
        if (visible) {
            if (data) {
                // Edit Mode
                setAmount(data.amount.toString());
                setTitle(data.name);
                setDescription(data.description || '');
                setCategory(data.type);
                setPaymentMode(data.payment_mode);
            } else {
                // Add Mode - Reset
                setAmount('');
                setTitle('');
                setDescription('');
                setCategory('others');
                setPaymentMode('cash');
            }
        }
    }, [visible, data]);

    const handleSubmit = async () => {
        if (!amount || !title) {
            ToastAndroid.show('Please enter amount and title', ToastAndroid.SHORT);
            return;
        }

        setLoading(true);
        const start = Date.now(); // Min loading time for smooth UX

        try {
            if (data) {
                // UPDATE logic
                const { error } = await supabase.from('kharcha')
                    .update({
                        name: title,
                        amount: parseFloat(amount),
                        description: description,
                        type: category,
                        payment_mode: paymentMode,
                    })
                    .eq('id', data.id);

                if (error) throw error;

                dispatch(updateKharcha({
                    id: data.id,
                    name: title,
                    amount: parseFloat(amount),
                    description,
                    type: category,
                    payment_mode: paymentMode,
                    updated_at: new Date().toISOString()
                }));
                ToastAndroid.show('Updated successfully', ToastAndroid.SHORT);

            } else {
                // INSERT logic
                const { data: newKharcha, error } = await supabase.from('kharcha')
                    .insert({
                        name: title,
                        amount: parseFloat(amount),
                        description: description,
                        type: category,
                        payment_mode: paymentMode,
                        khata_id: khataId,
                        created_by: user?.id,
                    })
                    .select("*, users(full_name, avatar)")
                    .single();

                if (error) throw error;

                if (newKharcha) {
                    dispatch(addKharcha(newKharcha as any));
                    // Send Notifications
                    members.forEach((member: Member) => {
                        if (member.id !== user?.id) {
                            sendPushNotification({
                                to: member.expo_push_token || '',
                                title: `New Expense: ${title}`,
                                body: `${user?.full_name} spent ₹${amount} in ${khataName}`,
                                data: { url: `/kharcha/${khataId}` as string }
                            });
                            createNotificationInDB(
                                `New Expense: ${title}`,
                                `${user?.full_name} spent ₹${amount} in ${khataName}`,
                                { url: `/kharcha/${khataId}` as string },
                                member.id,
                                'new_kharcha'
                            );
                        }
                    });
                }
                ToastAndroid.show('Added successfully', ToastAndroid.SHORT);
            }

            handleClose();

        } catch (e: any) {
            console.error(e);
            ToastAndroid.show('Error: ' + e.message, ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        Keyboard.dismiss();
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={{ flex: 1 }}>
                {/* Backdrop */}
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardView}
                    pointerEvents="box-none"
                >
                    <View style={[
                        styles.sheetContainer,
                        { backgroundColor: isDark ? '#1e1e1e' : '#fff' }
                    ]}>

                        {/* Header Handle */}
                        <View style={styles.handleContainer}>
                            <View style={[styles.handleBar, { backgroundColor: isDark ? '#444' : '#e0e0e0' }]} />
                        </View>

                        <View style={styles.header}>
                            <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>
                                {data ? 'Edit Expense' : 'New Expense'}
                            </Text>
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={isDark ? '#aaa' : '#666'} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                            style={{ flex: 1 }}
                        >
                            {/* 1. Amount Input (Large) */}
                            <View style={styles.amountContainer}>
                                <Text style={[styles.currencySymbol, { color: isDark ? '#aaa' : '#888' }]}>₹</Text>
                                <TextInput
                                    style={[styles.amountInput, { color: isDark ? '#fff' : '#000' }]}
                                    value={amount}
                                    onChangeText={setAmount}
                                    placeholder="0"
                                    placeholderTextColor={isDark ? '#555' : '#ccc'}
                                    keyboardType="numeric"
                                    autoFocus={!data}
                                />
                            </View>

                            {/* 2. Main Details */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: isDark ? '#bbb' : '#555' }]}>Title</Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: isDark ? '#2c2c2c' : '#f5f5f5',
                                        color: isDark ? '#fff' : '#000'
                                    }]}
                                    placeholder="What is this for?"
                                    placeholderTextColor={isDark ? '#666' : '#aaa'}
                                    value={title}
                                    onChangeText={setTitle}
                                />
                            </View>

                            {/* 3. Category Grid - Horizontal Scroll */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: isDark ? '#bbb' : '#555' }]}>Category</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
                                    {CATEGORIES.map((cat) => {
                                        const isSelected = category === cat.value;
                                        return (
                                            <TouchableOpacity
                                                key={cat.value}
                                                onPress={() => setCategory(cat.value)}
                                                style={[
                                                    styles.chip,
                                                    {
                                                        backgroundColor: isSelected ? cat.color : (isDark ? '#2c2c2c' : '#f5f5f5'),
                                                        borderColor: isSelected ? 'transparent' : (isDark ? '#444' : '#eee'),
                                                        borderWidth: 1
                                                    }
                                                ]}
                                            >
                                                <Ionicons
                                                    name={cat.icon as any}
                                                    size={18}
                                                    color={isSelected ? '#fff' : (isDark ? '#bbb' : '#666')}
                                                />
                                                <Text style={[
                                                    styles.chipText,
                                                    { color: isSelected ? '#fff' : (isDark ? '#bbb' : '#666') }
                                                ]}>
                                                    {cat.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>

                            {/* 4. Payment Mode */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: isDark ? '#bbb' : '#555' }]}>Paid Via</Text>
                                <View style={styles.paymentRow}>
                                    {PAYMENT_MODES.map((mode) => {
                                        const isSelected = paymentMode === mode.value;
                                        return (
                                            <TouchableOpacity
                                                key={mode.value}
                                                onPress={() => setPaymentMode(mode.value)}
                                                style={[
                                                    styles.paymentOption,
                                                    {
                                                        borderColor: isSelected ? theme.colors.primary : (isDark ? '#444' : '#ddd'),
                                                        backgroundColor: isSelected ? (isDark ? '#1a2e40' : '#eff6ff') : 'transparent'
                                                    }
                                                ]}
                                            >
                                                <Ionicons
                                                    name={mode.icon as any}
                                                    size={20}
                                                    color={isSelected ? theme.colors.primary : (isDark ? '#aaa' : '#666')}
                                                />
                                                <Text style={[
                                                    styles.paymentText,
                                                    { color: isSelected ? theme.colors.primary : (isDark ? '#aaa' : '#666') }
                                                ]}>
                                                    {mode.label}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            </View>
                        </ScrollView>

                        {/* Footer Action */}
                        <View style={[styles.footer, { borderTopColor: isDark ? '#333' : '#eee', backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
                            <TouchableOpacity
                                style={[styles.saveButton, { opacity: loading ? 0.7 : 1 }]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                <Text style={styles.saveButtonText}>
                                    {loading ? 'Saving...' : (data ? 'Update Expense' : 'Save Expense')}
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

export default AddEditKharchaModal;

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1,
    },
    keyboardView: {
        justifyContent: 'flex-end',
        flex: 1,
        zIndex: 2,
    },
    sheetContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        width: '100%',
        height: '90%',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handleBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
        position: 'relative',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    closeButton: {
        position: 'absolute',
        right: 20,
        padding: 4,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    amountContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    currencySymbol: {
        fontSize: 28,
        fontWeight: '500',
        marginTop: 8,
        marginRight: 4,
    },
    amountInput: {
        fontSize: 48,
        fontWeight: 'bold',
        textAlign: 'center',
        minWidth: 100,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
    chipsContainer: {
        gap: 10,
        paddingRight: 20,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    paymentRow: {
        flexDirection: 'row',
        gap: 10,
    },
    paymentOption: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 6,
    },
    paymentText: {
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
