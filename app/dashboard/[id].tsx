import {
    StyleSheet,
    View,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import Header from '@/components/Header';
import { hp, wp } from '@/helpers/common';
import { PieChart, BarChart } from "react-native-gifted-charts";
import { supabase } from '@/lib/supabase';
import { useColorScheme } from '@/hooks/useColorScheme.web';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

const KhataDashboard = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Stats
    const [totalSpent, setTotalSpent] = useState(0);
    const [monthlySpent, setMonthlySpent] = useState(0);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [barData, setBarData] = useState<any[]>([]);

    const fetchDashboardData = async () => {
        if (!id) return;
        try {
            setLoading(true);

            // Fetch ALL expenses for this specific KHATA
            const { data: kharchaData, error: kharchaError } = await supabase
                .from('kharcha')
                .select('amount, type, created_at, name')
                .eq('khata_id', id)
                .order('created_at', { ascending: false });

            if (kharchaError || !kharchaData) {
                console.error("Error fetching kharcha", kharchaError);
                setLoading(false);
                return;
            }

            // --- Process Data ---

            // A. Total Spent
            const total = kharchaData.reduce((sum, item) => sum + item.amount, 0);
            setTotalSpent(total);

            // B. Monthly Spent (Current Month)
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthly = kharchaData
                .filter(item => {
                    const d = new Date(item.created_at);
                    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                })
                .reduce((sum, item) => sum + item.amount, 0);
            setMonthlySpent(monthly);

            // C. Category Breakdown (Pie Chart)
            const categoryMap: { [key: string]: number } = {};
            kharchaData.forEach(item => {
                const cat = item.type || 'others';
                categoryMap[cat] = (categoryMap[cat] || 0) + item.amount;
            });

            const CATEGORY_COLORS: { [key: string]: string } = {
                food: '#FF6B6B',
                transport: '#4ECDC4',
                shopping: '#45B7D1',
                healthcare: '#FF9F43',
                utilities: '#F7B731',
                entertainment: '#A55EEA',
                travel: '#26de81',
                fuel: '#778ca3',
                others: '#d1d8e0'
            };

            const pieChartData = Object.keys(categoryMap).map(cat => ({
                value: categoryMap[cat],
                color: CATEGORY_COLORS[cat] || '#ccc',
                text: `${Math.round((categoryMap[cat] / total) * 100)}%`,
                label: cat.charAt(0).toUpperCase() + cat.slice(1)
            })).sort((a, b) => b.value - a.value).slice(0, 5);
            setCategoryData(pieChartData);

            // D. Weekly Spending (Bar Chart) - Last 7 Days
            const sevenDaysMetrics: { label: string, value: number, dateStr: string }[] = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                sevenDaysMetrics.push({
                    label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    value: 0,
                    dateStr: d.toISOString().split('T')[0]
                })
            }

            kharchaData.forEach(item => {
                const itemDateStr = item.created_at.split('T')[0];
                const found = sevenDaysMetrics.find(m => m.dateStr === itemDateStr);
                if (found) {
                    found.value += item.amount;
                }
            });

            setBarData(sevenDaysMetrics.map(m => ({
                value: m.value,
                label: m.label,
                frontColor: theme.colors.primary,
                spacing: 14 // Adjust based on screen width
            })));

            setLoading(false);

        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [id]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
    }, [id]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <ScreenWrapper>
            <ThemedView style={styles.container}>
                <Header name="Khata Analytics" />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {/* 1. Summary Cards */}
                    <View style={styles.summaryRow}>
                        <LinearGradient
                            colors={isDark ? ['#334', '#223'] : ['#eef2ff', '#e0e7ff']}
                            style={styles.summaryCard}
                        >
                            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff' }]}>
                                <Ionicons name="wallet-outline" size={24} color={theme.colors.primary} />
                            </View>
                            <View>
                                <ThemedText style={styles.summaryLabel}>Total Expense</ThemedText>
                                <ThemedText style={styles.summaryValue}>{formatCurrency(totalSpent)}</ThemedText>
                            </View>
                        </LinearGradient>

                        <LinearGradient
                            colors={isDark ? ['#333', '#222'] : ['#fefce8', '#fef9c3']}
                            style={styles.summaryCard}
                        >
                            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff' }]}>
                                <Ionicons name="calendar-outline" size={24} color="#F7B731" />
                            </View>
                            <View>
                                <ThemedText style={styles.summaryLabel}>This Month</ThemedText>
                                <ThemedText style={styles.summaryValue}>{formatCurrency(monthlySpent)}</ThemedText>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* 2. Bar Chart Section */}
                    <ThemedView style={[styles.chartContainer, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
                        <ThemedText style={styles.chartTitle}>Last 7 Days Spending</ThemedText>
                        <View style={{ overflow: 'hidden', paddingRight: 20 }}>
                            <BarChart
                                data={barData}
                                barWidth={22}
                                noOfSections={3}
                                barBorderRadius={4}
                                frontColor={theme.colors.primary}
                                yAxisThickness={0}
                                xAxisThickness={0}
                                hideRules
                                isAnimated
                                height={150}
                                width={width - 80} // Approx padding adjustment
                                labelTextStyle={{ color: isDark ? '#aaa' : '#666', fontSize: 10 }}
                            />
                        </View>
                    </ThemedView>

                    {/* 3. Pie Chart Section */}
                    {categoryData.length > 0 && (
                        <ThemedView style={[styles.chartContainer, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
                            <ThemedText style={styles.chartTitle}>Category Breakdown</ThemedText>
                            <View style={styles.pieContainer}>
                                <PieChart
                                    data={categoryData}
                                    donut
                                    showGradient
                                    sectionAutoFocus
                                    radius={70}
                                    innerRadius={50}
                                    focusOnPress
                                    centerLabelComponent={() => (
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>{categoryData.length}</ThemedText>
                                            <ThemedText style={{ fontSize: 10, color: '#aaa' }}>Cats</ThemedText>
                                        </View>
                                    )}
                                />
                                <View style={styles.legendContainer}>
                                    {categoryData.map((cat, index) => (
                                        <View key={index} style={styles.legendItem}>
                                            <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                                            <ThemedText style={styles.legendText}>{cat.label} ({cat.text})</ThemedText>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </ThemedView>
                    )}

                </ScrollView>
            </ThemedView>
        </ScreenWrapper>
    );
};

export default KhataDashboard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: wp(4),
        paddingBottom: hp(10),
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 2,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    chartContainer: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        // Shadows
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
    },
    pieContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    legendContainer: {
        gap: 8,
        flex: 1,
        marginLeft: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 12,
        flex: 1,
    },
});
