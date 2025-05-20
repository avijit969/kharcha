import { BackHandler, StyleSheet, View, useColorScheme } from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import Header from '@/components/Header';
import { useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { Kharcha } from '../kharcha/[id]';
import { wp } from '@/helpers/common';
import Button from '@/components/Button';
import UserKharchaSplitModal from '@/components/UserKharchaSplitModal';

const KharchaDashboard = () => {
    const { khata_id } = useLocalSearchParams();
    const kataha = useSelector((state: RootState) => state.khata.find((k) => k.id === khata_id));
    const kharcha = useSelector((state: RootState) => state.kharcha.kharcha.filter((k) => k.khata_id === khata_id));
    const theme = useColorScheme() || 'light';
    const { background, text, primary } = getThemeColors(theme);
    const { userTotals, typeTotals } = processKharchaData(kharcha);
    const [isShowSplitModal, setIsShowSplitModal] = useState(false);
    const userBarData = Object.entries(userTotals).map(([name, { amount }]) => ({
        value: amount,
        label: name.split(' ')[0],
        frontColor: primary,
    }));

    const typePieData = Object.entries(typeTotals).map(([type, value], index) => ({
        value,
        text: type,
        color: ['#FF7F50', '#20B2AA', '#FFD700', '#BA55D3', '#1E90FF'][index % 5],
    }));

    return (
        <ScreenWrapper>
            <ThemedView style={[styles.container]}>
                <Header name={`${kataha?.name} Dashboard`} />

                <ThemedText style={[styles.heading, { color: text }]}>User wise Spending</ThemedText>
                <BarChart
                    barWidth={30}
                    data={userBarData}
                    height={200}
                    noOfSections={4}
                    spacing={30}
                    roundedTop
                    isAnimated
                    xAxisColor={text}
                    yAxisColor={text}
                    xAxisLabelTextStyle={{ color: text }}
                    yAxisTextStyle={{ color: text }}
                    showValuesAsTopLabel
                    topLabelContainerStyle={[{ width: 100, height: 30, marginTop: 10 }, { textColor: text }]}
                    topLabelTextStyle={{ color: text }}
                />

                <ThemedText style={[styles.heading, { color: text }]}>Category wise Spending</ThemedText>
                <PieChart
                    data={typePieData}
                    donut
                    showText
                    textColor={text}
                    radius={90}
                    innerRadius={50}
                    focusOnPress
                />
                <View style={styles.legendContainer}>
                    {typePieData.map((item, index) => (
                        <View key={index} style={styles.legendItem}>
                            <View style={[styles.colorBox, { backgroundColor: item.color }]} />
                            <ThemedText style={[styles.legendLabel, { color: text }]}>
                                {item.text}: ₹{item.value}
                            </ThemedText>
                        </View>
                    ))}
                </View>
                <Button title="View Splits" onPress={() => {
                    setIsShowSplitModal(true);
                }} />
            </ThemedView>
            <UserKharchaSplitModal visible={isShowSplitModal} onClose={() => setIsShowSplitModal(false)} userKharcha={userBarData} khataId={khata_id as string} />
        </ScreenWrapper>
    );
};

export default KharchaDashboard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp(3),
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    legendContainer: {
        marginTop: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 8,
    },
    colorBox: {
        width: 14,
        height: 14,
        borderRadius: 4,
        marginRight: 6,
    },
    legendLabel: {
        fontSize: 14,
    },

});

// Util to get colors based on theme
const getThemeColors = (theme: 'light' | 'dark' | null) => {
    if (theme === 'dark') {
        return {
            background: '#000',
            text: '#fff',
            primary: '#9370DB',
        };
    }
    return {
        background: '#fff',
        text: '#000',
        primary: '#6A5ACD',
    };
};

// Aggregation logic
const processKharchaData = (kharcha: Kharcha[]) => {
    const userTotals = {} as { [key: string]: { amount: number; avatar?: string } };
    const typeTotals = {} as { [key: string]: number };

    kharcha.forEach(item => {
        const userName = item.users.full_name;
        const type = item.type;
        const amount = item.amount;

        if (!userTotals[userName]) {
            userTotals[userName] = { amount: 0, avatar: item.users.avatar };
        }
        userTotals[userName].amount += amount;

        if (!typeTotals[type]) {
            typeTotals[type] = 0;
        }
        typeTotals[type] += amount;
    });

    return { userTotals, typeTotals };
};
