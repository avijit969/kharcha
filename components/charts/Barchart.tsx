import { StyleSheet, useColorScheme, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { PieChart } from 'react-native-gifted-charts';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { hp, wp } from '@/helpers/common';
import { supabase } from '@/lib/supabase';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Icon from 'react-native-vector-icons/Ionicons';

const Piechart = () => {
    const [pieData, setPieData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const themeColor = useColorScheme();
    const authUser = useSelector((state: RootState) => state.user.user);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .rpc('get_khata_kharcha_summary')
            .eq('user_id', authUser.id);

        if (error) {
            console.error('Error fetching data:', error);
        } else if (data) {
            const colors = ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff', '#f67019'];
            const transformed = data.map((item: any, index: number) => ({
                value: Number(item.total_amount.toFixed(2)),
                color: colors[index % colors.length],
                name: item.khata_name
            }));
            setPieData(transformed);
        }
        setIsLoading(false);
    }, [authUser.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.heading}>
                    The Total kharcha Amount Of Each Khata
                </ThemedText>
                <TouchableOpacity onPress={fetchData} disabled={isLoading}>
                    <Icon
                        name="refresh"
                        size={24}
                        color={isLoading ? 'gray' : themeColor === 'dark' ? 'white' : 'black'}
                    />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#36a2eb" style={{ marginTop: 20 }} />
            ) : pieData.length > 0 ? (
                <>
                    <PieChart
                        data={pieData}
                        donut
                        showValuesAsLabels
                        showText
                        textSize={18}
                        textColor={themeColor === 'dark' ? 'white' : 'black'}
                        radius={100}
                        innerRadius={50}
                        innerCircleColor={themeColor === 'dark' ? 'rgba(0, 0, 0, 0.77)' : 'rgba(0, 0, 0, 0.1)'}
                        focusOnPress
                        strokeColor="white"
                        labelsPosition="outward"
                    />
                    <View style={styles.legendContainer}>
                        {pieData.map((item: any, index: number) => (
                            <View key={index} style={styles.legendItem}>
                                <View style={[styles.colorBox, { backgroundColor: item.color }]} />
                                <ThemedView style={{ flexDirection: "column" }}>
                                    <ThemedText style={styles.legendText}>{item.name}</ThemedText>
                                    <ThemedText style={styles.legendText}>{item.value}</ThemedText>
                                </ThemedView>
                            </View>
                        ))}
                    </View>
                </>
            ) : (
                <View style={styles.noDataContainer}>
                    <ThemedText style={styles.noDataText}>No Data Found</ThemedText>
                </View>
            )}
        </ThemedView>
    );
};

export default Piechart;

const styles = StyleSheet.create({
    container: {
        marginTop: hp(1),
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: wp(90),
        alignItems: 'center',
        marginBottom: 10,
    },
    heading: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
    },
    noDataContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        marginBottom: 10,
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        marginHorizontal: 5,
    },
    colorBox: {
        width: wp(8),
        height: wp(8),
        marginRight: 5,
    },
    legendText: {
        fontSize: wp(3),
        fontWeight: 'bold',
        width: wp(30),
    },
});
