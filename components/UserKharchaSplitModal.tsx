import {
    Modal,
    ScrollView,
    StyleSheet,
    View,
    Share,
    Linking,
    Image,
    TouchableOpacity,
} from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { hp, wp } from '@/helpers/common';
import { useColorScheme } from '@/hooks/useColorScheme.web';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface UserKharchaSplitModalProps {
    visible: boolean;
    onClose: () => void;
    khataId: string;
    userKharcha: {
        value: number;
        label: string;
        frontColor: string;
    }[];
}

const UserKharchaSplitModal: React.FC<UserKharchaSplitModalProps> = ({
    visible,
    onClose,
    userKharcha,
    khataId,
}) => {
    const theme = useColorScheme();

    const allMembers = useSelector(
        (state: RootState) =>
            state.khata_members.khata_members.find(km => km.khata_id === khataId)?.members || []
    );

    // Build full userKharcha including all members with zero for missing ones
    const fullUserKharcha = allMembers.map(member => {
        // FIXED LINE: match short label inside full name
        const kharchaForMember = userKharcha.find(k => member.full_name.includes(k.label));
        return {
            label: member.full_name,
            value: kharchaForMember ? kharchaForMember.value : 0,
            frontColor: kharchaForMember ? kharchaForMember.frontColor : '',
        };
    });

    // Calculate total and share based on all members
    const total = fullUserKharcha.reduce((sum, u) => sum + u.value, 0);
    const share = fullUserKharcha.length > 0 ? total / fullUserKharcha.length : 0;

    // Calculate balances (amount contributed - share)
    const balances = fullUserKharcha.map(({ label, value }) => ({
        label,
        amount: value - share,
    }));

    // Helper to find member by label
    const findMember = (label: string) => allMembers.find(m => m.full_name === label);

    // Separate creditors and debtors
    const creditors = [...balances].filter(b => b.amount > 0).sort((a, b) => b.amount - a.amount);
    const debtors = [...balances].filter(b => b.amount < 0).sort((a, b) => a.amount - b.amount);

    // Calculate minimal transactions to settle debts
    const transactions: { from: string; to: string; amount: number }[] = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const settleAmount = Math.min(-debtor.amount, creditor.amount);

        transactions.push({
            from: debtor.label,
            to: creditor.label,
            amount: Math.round(settleAmount),
        });

        debtor.amount += settleAmount;
        creditor.amount -= settleAmount;

        if (Math.abs(debtor.amount) < 0.01) i++;
        if (Math.abs(creditor.amount) < 0.01) j++;
    }

    // Share summary string for sharing
    const shareSummary =
        `Total: ₹${total.toFixed(2)}\nPer Person: ₹${share.toFixed(2)}\n\nSettlements:\n` +
        (transactions.length
            ? transactions.map(t => `${t.from} pays ₹${t.amount} to ${t.to}`).join('\n')
            : 'All users have settled equally.');

    // Share handlers
    const handleShare = async () => {
        try {
            await Share.share({ message: shareSummary });
        } catch (error) {
            console.error('Share failed:', error);
        }
    };

    const handleWhatsAppShare = () => {
        const message = encodeURIComponent(shareSummary);
        const url = `https://wa.me/?text=${message}`;
        Linking.openURL(url).catch(err => console.error('WhatsApp sharing error:', err));
    };

    return (
        <Modal visible={visible} animationType="fade" transparent={false}>
            <ThemedView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={[
                            styles.backBtnIcon,
                            {
                                backgroundColor:
                                    theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            },
                        ]}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme === 'dark' ? 'white' : 'black'} />
                    </TouchableOpacity>
                    <ThemedText style={styles.title}>All users kharcha split</ThemedText>
                </View>

                {/* Content */}
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Total & Share Info */}
                    <ThemedView style={styles.section}>
                        <ThemedText>Total: ₹{total.toFixed(2)}</ThemedText>
                        <ThemedText>Per person: ₹{share.toFixed(2)}</ThemedText>
                    </ThemedView>

                    {/* User Contributions */}
                    <ThemedView style={styles.section}>
                        <ThemedText style={styles.subTitle}>Contributions:</ThemedText>
                        {fullUserKharcha.map((kharcha, index) => {
                            const member = findMember(kharcha.label);
                            return (
                                <ThemedView key={index} style={styles.row}>
                                    <View style={styles.avatarRow}>
                                        {member?.avatar && (
                                            <Image source={{ uri: member.avatar }} style={styles.avatar} />
                                        )}
                                        <ThemedText>{kharcha.label}</ThemedText>
                                    </View>
                                    <ThemedText style={{ color: kharcha.frontColor }}>
                                        ₹ {kharcha.value}
                                    </ThemedText>
                                </ThemedView>
                            );
                        })}
                    </ThemedView>

                    {/* Settlements */}
                    <ThemedView style={styles.section}>
                        <ThemedText style={styles.subTitle}>Who pays whom:</ThemedText>
                        {transactions.length > 0 ? (
                            transactions.map((t, index) => (
                                <ThemedView key={index} style={styles.row}>
                                    <ThemedText>{t.from}</ThemedText>
                                    <ThemedText>₹ {t.amount} →</ThemedText>
                                    <ThemedText>{t.to}</ThemedText>
                                </ThemedView>
                            ))
                        ) : (
                            <ThemedText style={{ fontStyle: 'italic' }}>
                                All users have settled equally.
                            </ThemedText>
                        )}
                    </ThemedView>
                </ScrollView>

                {/* Share Buttons */}
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        gap: wp(3),
                        marginTop: hp(2),
                    }}
                >
                    <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                        <Ionicons name="share-social-outline" size={18} color="white" />
                        <ThemedText style={styles.shareText}>Share Summary</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareBtn} onPress={handleWhatsAppShare}>
                        <Ionicons name="logo-whatsapp" size={18} color="white" />
                        <ThemedText style={styles.shareText}>WhatsApp</ThemedText>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        </Modal>
    );
};

export default UserKharchaSplitModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(2),
        gap: wp(2),
    },
    backBtnIcon: {
        padding: 8,
        borderRadius: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    subTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: hp(1),
    },
    section: {
        marginBottom: hp(2),
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(0.8),
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    shareBtn: {
        flex: 1,
        backgroundColor: '#007AFF',
        paddingVertical: hp(1),
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: wp(2),
    },
    shareText: {
        color: 'white',
        fontWeight: '600',
    },
});
