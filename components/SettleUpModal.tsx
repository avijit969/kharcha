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
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { supabase } from '@/lib/supabase';

interface SettleUpModalProps {
    visible: boolean;
    onClose: () => void;
    khataId: string;
    khataName?: string;
    onSuccess?: () => void;
}

const PAYMENT_MODES = [
    { label: 'Cash', value: 'cash', icon: 'cash-outline' },
    { label: 'UPI / Online', value: 'upi', icon: 'card-outline' },
    { label: 'Bank Transfer', value: 'bank_transfer', icon: 'business-outline' },
];

const SettleUpModal: React.FC<SettleUpModalProps> = ({
    visible,
    onClose,
    khataId,
    khataName,
    onSuccess
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // State
    const [amount, setAmount] = useState('');
    const [payerId, setPayerId] = useState<string>('');
    const [payeeId, setPayeeId] = useState<string>('');
    const [description, setDescription] = useState('');
    const [paymentMode, setPaymentMode] = useState('cash');
    const [loading, setLoading] = useState(false);

    // Selectors
    const user = useSelector((state: RootState) => state.user.user);
    const members = useSelector((state: RootState) => state.khata_members.khata_members)
        .find(m => m.khata_id === khataId)?.members || [];

    useEffect(() => {
        if (visible) {
            setAmount('');
            setDescription('');
            setPaymentMode('cash');
            // Default: Current user pays first member that isn't them
            setPayerId(user?.id || '');
            const otherMember = members.find(m => m.id !== user?.id);
            setPayeeId(otherMember?.id || '');
        }
    }, [visible, user, members]);

    const handleSubmit = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            ToastAndroid.show('Please enter a valid amount', ToastAndroid.SHORT);
            return;
        }
        if (!payerId || !payeeId) {
            ToastAndroid.show('Please select payer and payee', ToastAndroid.SHORT);
            return;
        }
        if (payerId === payeeId) {
            ToastAndroid.show('Payer and Payee cannot be the same', ToastAndroid.SHORT);
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.from('settlements').insert({
                khata_id: khataId,
                payer_id: payerId,
                payee_id: payeeId,
                amount: parseFloat(amount),
                payment_mode: paymentMode,
                description: description
            });

            if (error) throw error;

            ToastAndroid.show('Settlement recorded successfully', ToastAndroid.SHORT);
            onSuccess?.();
            handleClose();
        } catch (error: any) {
            console.error('Settlement Error:', error);
            ToastAndroid.show(error.message || 'Failed to record settlement', ToastAndroid.SHORT);
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
                        {/* Handle */}
                        <View style={styles.handleContainer}>
                            <View style={[styles.handleBar, { backgroundColor: isDark ? '#444' : '#e0e0e0' }]} />
                        </View>

                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>
                                Record Settlement
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
                            {/* Amount Input */}
                            <View style={styles.amountContainer}>
                                <Text style={[styles.currencySymbol, { color: isDark ? '#aaa' : '#888' }]}>₹</Text>
                                <TextInput
                                    style={[styles.amountInput, { color: isDark ? '#fff' : '#000' }]}
                                    value={amount}
                                    onChangeText={setAmount}
                                    placeholder="0"
                                    placeholderTextColor={isDark ? '#555' : '#ccc'}
                                    keyboardType="numeric"
                                    autoFocus
                                />
                            </View>

                            {/* Who Paid Who */}
                            <View style={styles.transferRow}>
                                {/* Payer */}
                                <View style={styles.personCol}>
                                    <Text style={[styles.label, { color: isDark ? '#bbb' : '#555' }]}>Paid By</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
                                        {members.map(member => (
                                            <TouchableOpacity
                                                key={member.id}
                                                style={[
                                                    styles.personChip,
                                                    {
                                                        backgroundColor: payerId === member.id ? (isDark ? '#1a2e40' : '#eff6ff') : 'transparent',
                                                        borderColor: payerId === member.id ? theme.colors.primary : (isDark ? '#444' : '#ddd')
                                                    }
                                                ]}
                                                onPress={() => setPayerId(member.id)}
                                            >
                                                <View style={styles.avatarPlaceholder}>
                                                    <Text style={styles.avatarText}>{member.full_name?.[0]}</Text>
                                                </View>
                                                <Text style={[styles.personName, { color: isDark ? '#ccc' : '#333' }]}>
                                                    {member.id === user?.id ? 'You' : member.full_name?.split(' ')[0]}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>

                            <View style={styles.arrowContainer}>
                                <Ionicons name="arrow-down" size={24} color={theme.colors.primary} />
                            </View>

                            <View style={styles.transferRow}>
                                {/* Payee */}
                                <View style={styles.personCol}>
                                    <Text style={[styles.label, { color: isDark ? '#bbb' : '#555' }]}>Paid To</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
                                        {members.map(member => (
                                            <TouchableOpacity
                                                key={member.id}
                                                style={[
                                                    styles.personChip,
                                                    {
                                                        backgroundColor: payeeId === member.id ? (isDark ? '#1a2e40' : '#eff6ff') : 'transparent',
                                                        borderColor: payeeId === member.id ? theme.colors.primary : (isDark ? '#444' : '#ddd')
                                                    }
                                                ]}
                                                onPress={() => setPayeeId(member.id)}
                                            >
                                                <View style={styles.avatarPlaceholder}>
                                                    <Text style={styles.avatarText}>{member.full_name?.[0]}</Text>
                                                </View>
                                                <Text style={[styles.personName, { color: isDark ? '#ccc' : '#333' }]}>
                                                    {member.id === user?.id ? 'You' : member.full_name?.split(' ')[0]}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>

                            {/* Payment Mode */}
                            <View style={[styles.inputGroup, { marginTop: 20 }]}>
                                <Text style={[styles.label, { color: isDark ? '#bbb' : '#555' }]}>Payment Mode</Text>
                                <View style={styles.paymentRow}>
                                    {PAYMENT_MODES.map((mode) => (
                                        <TouchableOpacity
                                            key={mode.value}
                                            onPress={() => setPaymentMode(mode.value)}
                                            style={[
                                                styles.paymentOption,
                                                {
                                                    borderColor: paymentMode === mode.value ? theme.colors.primary : (isDark ? '#444' : '#ddd'),
                                                    backgroundColor: paymentMode === mode.value ? (isDark ? '#1a2e40' : '#eff6ff') : 'transparent'
                                                }
                                            ]}
                                        >
                                            <Ionicons
                                                name={mode.icon as any}
                                                size={20}
                                                color={paymentMode === mode.value ? theme.colors.primary : (isDark ? '#aaa' : '#666')}
                                            />
                                            <Text style={[
                                                styles.paymentText,
                                                { color: paymentMode === mode.value ? theme.colors.primary : (isDark ? '#aaa' : '#666') }
                                            ]}>
                                                {mode.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Note */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: isDark ? '#bbb' : '#555' }]}>Note (Optional)</Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: isDark ? '#2c2c2c' : '#f5f5f5',
                                        color: isDark ? '#fff' : '#000'
                                    }]}
                                    placeholder="e.g. Returned for lunch"
                                    placeholderTextColor={isDark ? '#666' : '#aaa'}
                                    value={description}
                                    onChangeText={setDescription}
                                />
                            </View>

                        </ScrollView>

                        {/* Footer */}
                        <View style={[styles.footer, { borderTopColor: isDark ? '#333' : '#eee', backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
                            <TouchableOpacity
                                style={[styles.saveButton, { opacity: loading ? 0.7 : 1 }]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                <Text style={styles.saveButtonText}>
                                    {loading ? 'Recording...' : 'Record Settlement'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

export default SettleUpModal;

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
        height: '85%',
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
    transferRow: {
        marginBottom: 10,
    },
    personCol: {
        gap: 8,
    },
    arrowContainer: {
        alignItems: 'center',
        marginVertical: -5,
        zIndex: 10,
    },
    chipsContainer: {
        gap: 10,
        paddingRight: 20,
    },
    personChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        gap: 8,
    },
    personName: {
        fontWeight: '600',
        fontSize: 14,
    },
    avatarPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#555',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputGroup: {
        marginBottom: 20,
    },
    input: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
    paymentRow: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap'
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        gap: 6,
    },
    paymentText: {
        fontSize: 13,
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
