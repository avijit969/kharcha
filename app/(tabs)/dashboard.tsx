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

const { width } = Dimensions.get('window');

const Dashboard = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Stats
  const [totalSpent, setTotalSpent] = useState(0);
  const [monthlySpent, setMonthlySpent] = useState(0);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);
  const [recentKharcha, setRecentKharcha] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userSession = await supabase.auth.getSession();
      const userId = userSession.data.session?.user.id;

      if (!userId) return;

      // 1. Get all Khata IDs present in members table for this user
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('khata_id')
        .eq('user_id', userId);

      if (memberError || !memberData) {
        console.error("Error fetching members", memberError);
        setLoading(false);
        return;
      }

      const khataIds = memberData.map(m => m.khata_id);

      if (khataIds.length === 0) {
        setLoading(false);
        return;
      }

      // 2. Fetch all expenses for these khatas
      const { data: kharchaData, error: kharchaError } = await supabase
        .from('kharcha')
        .select('amount, type, created_at, name')
        .in('khata_id', khataIds)
        .order('created_at', { ascending: false });

      if (kharchaError || !kharchaData) {
        console.error("Error fetching kharcha", kharchaError);
        setLoading(false);
        return;
      }

      // --- Process Data ---

      // A. Total Spent
      const total = kharchaData.reduce((sum, item) => sum + item.amount!, 0);
      setTotalSpent(total);

      // B. Monthly Spent (Current Month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthly = kharchaData
        .filter(item => {
          const d = new Date(item.created_at || '');
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, item) => sum + item.amount!, 0);
      setMonthlySpent(monthly);

      // C. Category Breakdown (Pie Chart)
      const categoryMap: { [key: string]: number } = {};
      kharchaData.forEach(item => {
        const cat = item.type || 'others';
        categoryMap[cat] = (categoryMap[cat] || 0) + item.amount!;
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
      })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5 categories
      setCategoryData(pieChartData);

      // D. Weekly Spending (Bar Chart) - Last 7 Days
      const last7DaysMap: { [key: string]: number } = {};
      // Initialize last 7 days with 0
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayKey = d.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue...
        last7DaysMap[dayKey] = 0;
      }

      // Fill with real data
      // Note: This matches strictly by weekday name which is simplistic but visual enough for "Last 7 Days" roughly
      // Ideally we match by date stringYYYY-MM-DD. Let's do better.
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
        const itemDateStr = item.created_at!.split('T')[0];
        const found = sevenDaysMetrics.find(m => m.dateStr === itemDateStr);
        if (found) {
          found.value += item.amount!;
        }
      });

      setBarData(sevenDaysMetrics.map(m => ({
        value: m.value,
        label: m.label,
        frontColor: theme.colors.primary,
        spacing: 14 // Adjust based on screen width
      })));

      // E. Recent Activity
      setRecentKharcha(kharchaData.slice(0, 5));

      setLoading(false);

    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, []);

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
        <Header name="Dashboard" />
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
                width={width - 80}
                topLabelTextStyle={{ color: isDark ? '#aaa' : '#666', fontSize: wp(2.5) }}
                showValuesAsTopLabel
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

export default Dashboard;

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