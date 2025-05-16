import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ToastAndroid } from 'react-native';
import React, { useCallback, useState } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Dropdown } from 'react-native-element-dropdown';
import { useColorScheme } from '@/hooks/useColorScheme.web';
import { ThemedView } from './ThemedView';
import Button from './Button';
import { supabase } from '@/lib/supabase';
import { useDispatch } from 'react-redux';
import { addKharcha } from '@/features/kharcha/kharchaSlice';
import { wp } from '@/helpers/common';

interface AddKharchaBSProps {
    bottomSheetModalRef: React.RefObject<BottomSheetModal>;
    khataId: string;
}

const kharchaTypes = [
    { label: 'Food', value: 'food' },
    { label: 'Transport', value: 'transport' },
    { label: 'Utilities', value: 'utilities' },
];

const paymentModes = [
    { label: 'Cash', value: 'cash' },
    { label: 'Card', value: 'card' },
    { label: 'UPI', value: 'upi' },
];

const AddKrachaBS = ({ bottomSheetModalRef, khataId }: AddKharchaBSProps) => {
    const colorScheme = useColorScheme();
    const styles = colorScheme === 'dark' ? darkStyles : lightStyles;

    const [amount, setAmount] = useState('');
    const [kharchaName, setKharchaName] = useState('');
    const [kharchaType, setKharchaType] = useState("");
    const [paymentMode, setPaymentMode] = useState("");
    const dispatch = useDispatch();
    const handleSheetChanges = (index: number) => {
        console.log('Sheet changed to index', index);
    };

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                opacity={0.5}
            />
        ),
        []
    );

    const handleKeyPress = (key: string) => {
        if (key === 'C') {
            setAmount('');
        } else if (key === '⌫') {
            setAmount(amount.slice(0, -1));
        } else {
            setAmount(prev => prev + key);
        }
    };

    const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];
    // handel kharcha add
    const handleAddKharcha = async () => {
        console.log('Add kharcha', kharchaName, amount, kharchaType, paymentMode);
        const { data, error } = await supabase.from('kharcha').insert({
            name: kharchaName,
            amount: parseFloat(amount),
            type: kharchaType,
            payment_mode: paymentMode,
            khata_id: khataId,
            created_by: (await supabase.auth.getUser()).data.user?.id,
        }).select("*, users(full_name, avatar)");

        if (error) {
            console.error('Error adding kharcha:', error.message);
            ToastAndroid.show('Error adding kharcha', ToastAndroid.SHORT);
        } else {
            ToastAndroid.show('Kharcha added successfully!', ToastAndroid.SHORT);
            console.log('Kharcha added:', JSON.stringify(data, null, 2));
            dispatch(addKharcha({ id: data[0].id, name: kharchaName, amount: parseFloat(amount), type: kharchaType, payment_mode: paymentMode, created_by: data[0].created_by, khata_id: khataId, users: { full_name: data[0].users.full_name, avatar: data[0].users.avatar } }));
        }
        setKharchaName('');
        setAmount('');
        setKharchaType("");
        setPaymentMode("");

    };
    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            onChange={handleSheetChanges}
            snapPoints={['80%', '90%']}
            backdropComponent={renderBackdrop}
            backgroundStyle={styles.bottomSheetModal}
            handleIndicatorStyle={styles.handelIndicator}
        >
            <BottomSheetView style={styles.contentContainer}>
                {/* Kharcha Name */}
                <TextInput
                    style={styles.input}
                    placeholder="Kharcha Name"
                    value={kharchaName}
                    onChangeText={setKharchaName}
                    placeholderTextColor={colorScheme === 'dark' ? "white" : "black"}

                />
                <ThemedView style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
                }}>
                    {/* Kharcha Type Dropdown */}
                    <Dropdown
                        style={styles.dropdown}
                        data={kharchaTypes}
                        labelField="label"
                        valueField="value"
                        placeholder="Type"
                        value={kharchaType}
                        onChange={item => setKharchaType(item.value)}
                        containerStyle={styles.dropdownContainer}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                    />

                    {/* Payment Mode Dropdown */}
                    <Dropdown
                        style={styles.dropdown}
                        data={paymentModes}
                        labelField="label"
                        valueField="value"
                        placeholder="Payment Mode"
                        value={paymentMode}
                        onChange={item => setPaymentMode(item.value)}
                        containerStyle={styles.dropdownContainer}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                    />
                </ThemedView>
                {/* Amount Display */}
                <Text style={styles.amountText}>₹ {amount || '0'}</Text>

                {/* Custom Numeric Keypad */}
                <View style={styles.keypad}>
                    {keypadKeys.map(key => (
                        <TouchableOpacity
                            key={key}
                            onPress={() => handleKeyPress(key)}
                            style={styles.keypadKey}
                        >
                            <Text style={styles.keypadKeyText}>{key}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {/* Submit Button */}
                <Button title="Add" onPress={() => {
                    handleAddKharcha();
                    bottomSheetModalRef.current?.dismiss();
                }} />

            </BottomSheetView>
        </BottomSheetModal>
    );
};

export default AddKrachaBS;

const darkStyles = StyleSheet.create({
    bottomSheetModal: {
        backgroundColor: '#333',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    handelIndicator: {
        backgroundColor: '#888',
        height: 5,
        width: 40,
        alignSelf: 'center',
        borderRadius: 3,
        marginVertical: 10,
    },
    contentContainer: {
        flex: 1,
        padding: 20,
    },
    dropdownContainer: {
        borderRadius: 8,
        backgroundColor: '#555',
    },
    placeholderStyle: {
        color: 'white',
    },
    selectedTextStyle: {
        color: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    amountText: {
        fontSize: 32,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    keypad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    keypadKey: {
        width: '30%',
        paddingVertical: 15,
        borderRadius: 10,
        backgroundColor: '#555',
        alignItems: 'center',
        marginVertical: 5,
    },
    keypadKeyText: {
        fontSize: 24,
        color: '#fff',
    },
    input: {
        backgroundColor: '#444',
        color: '#fff',
        borderColor: '#666',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
    },
    dropdown: {
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: '#444',
        borderColor: '#666',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 14,
        marginBottom: 15,
    },
});

const lightStyles = StyleSheet.create({
    bottomSheetModal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    handelIndicator: {
        backgroundColor: '#ccc',
        height: 5,
        width: 40,
        alignSelf: 'center',
        borderRadius: 3,
        marginVertical: 10,
    },
    contentContainer: {
        flex: 1,
        padding: 20,
    },
    dropdownContainer: {
        borderRadius: 8,
    },
    placeholderStyle: {
        color: '#ccc',
    },
    selectedTextStyle: {
        color: '#000',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
    },
    amountText: {
        fontSize: 32,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
        marginBottom: 20,
    },
    keypad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    keypadKey: {
        width: '30%',
        paddingVertical: 15,
        borderRadius: 10,
        backgroundColor: '#eee',
        alignItems: 'center',
        marginVertical: 5,
    },
    keypadKeyText: {
        fontSize: 24,
        color: '#000',
    },
    input: {
        backgroundColor: '#fff',
        color: '#000',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
    },
    dropdown: {
        flex: 1,
        marginHorizontal: wp(.5),
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 14,
        marginBottom: 15,
    },
});

