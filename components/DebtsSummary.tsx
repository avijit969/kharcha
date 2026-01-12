import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { SimplifiedDebt, SettlementStats } from '@/helpers/settlement';
import { theme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme.web';

interface DebtsSummaryProps {
    stats: SettlementStats;
    members: any[];
    currentUserId?: string;
}

const DebtsSummary: React.FC<DebtsSummaryProps> = ({ stats, members, currentUserId }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const getMemberName = (id: string) => {
        if (id === currentUserId) return 'You';
        const member = members.find(m => m.id === id);
        return member ? member.full_name?.split(' ')[0] : 'Unknown';
    };

    if (stats.simplifiedDebts.length === 0) {
        return (
            <View style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#fff', borderColor: isDark ? '#333' : '#eee' }]}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="checkmark-circle-outline" size={48} color={theme.colors.success} />
                    <ThemedText style={styles.emptyText}>All settled up!</ThemedText>
                    <ThemedText style={styles.emptySubText}>No outstanding debts in this group.</ThemedText>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#fff', borderColor: isDark ? '#333' : '#eee' }]}>
            <ThemedText style={styles.title}>Balances</ThemedText>

            <View style={styles.debtsContainer}>
                {stats.simplifiedDebts.map((debt, index) => {
                    const isUserInvolved = debt.from === currentUserId || debt.to === currentUserId;
                    const isUserOwes = debt.from === currentUserId;

                    return (
                        <View key={index} style={[styles.debtRow, {
                            borderBottomWidth: index === stats.simplifiedDebts.length - 1 ? 0 : 1,
                            borderBottomColor: isDark ? '#333' : '#f0f0f0'
                        }]}>
                            <View style={styles.avatarContainer}>
                                {/* Debtor Avatar */}
                                <View style={styles.avatarPlaceholder}>
                                    <ThemedText style={styles.avatarInitial}>{getMemberName(debt.from)[0]}</ThemedText>
                                </View>

                                <View style={styles.arrowContainer}>
                                    <Ionicons name="arrow-forward" size={16} color={isDark ? '#666' : '#bbb'} />
                                </View>

                                {/* Creditor Avatar */}
                                <View style={styles.avatarPlaceholder}>
                                    <ThemedText style={styles.avatarInitial}>{getMemberName(debt.to)[0]}</ThemedText>
                                </View>
                            </View>

                            <View style={styles.detailsContainer}>
                                <ThemedText style={styles.debtText}>
                                    <ThemedText style={{ fontWeight: '700', color: isUserOwes ? theme.colors.rose : (isDark ? '#fff' : '#000') }}>
                                        {getMemberName(debt.from)}
                                    </ThemedText>
                                    {' owes '}
                                    <ThemedText style={{ fontWeight: '700', color: !isUserOwes && isUserInvolved ? theme.colors.success : (isDark ? '#fff' : '#000') }}>
                                        {getMemberName(debt.to)}
                                    </ThemedText>
                                </ThemedText>
                            </View>

                            <ThemedText style={[
                                styles.amountText,
                                { color: isUserOwes ? theme.colors.rose : (isUserInvolved ? theme.colors.success : (isDark ? '#ccc' : '#666')) }
                            ]}>
                                ₹{Math.round(debt.amount)}
                            </ThemedText>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

export default DebtsSummary;

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
    },
    emptySubText: {
        fontSize: 13,
        color: '#888',
    },
    debtsContainer: {
        gap: 0,
    },
    debtRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        justifyContent: 'space-between',
    },
    avatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#555',
    },
    arrowContainer: {
        width: 20,
        alignItems: 'center',
    },
    detailsContainer: {
        flex: 1,
        paddingHorizontal: 12,
    },
    debtText: {
        fontSize: 14,
    },
    amountText: {
        fontSize: 16,
        fontWeight: '700',
    }
});
