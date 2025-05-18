// components/ActionModal.tsx
import React from 'react';
import {
    Modal,
    StyleSheet,
    Pressable,
} from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

type ActionModalProps = {
    visible: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

const ActionModal: React.FC<ActionModalProps> = ({
    visible,
    title = 'Confirm Action',
    message,
    confirmText = 'Yes',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
}) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <ThemedView style={styles.backdrop}>
                <ThemedView style={styles.modalContainer}>
                    <ThemedText style={styles.title}>{title}</ThemedText>
                    <ThemedText style={styles.message}>{message}</ThemedText>
                    <ThemedView style={styles.buttonRow}>
                        <Pressable style={styles.cancelButton} onPress={onCancel}>
                            <ThemedText style={styles.cancelText}>{cancelText}</ThemedText>
                        </Pressable>
                        <Pressable style={styles.confirmButton} onPress={onConfirm}>
                            <ThemedText style={styles.confirmText}>{confirmText}</ThemedText>
                        </Pressable>
                    </ThemedView>
                </ThemedView>
            </ThemedView>
        </Modal>
    );
};

export default ActionModal;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        borderRadius: 12,
        padding: 24,
        width: '80%',
        alignItems: 'center',
        elevation: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#ddd',
        marginRight: 8,
        alignItems: 'center',
    },
    confirmButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#e74c3c',
        marginLeft: 8,
        alignItems: 'center',
    },
    cancelText: {
        color: '#333',
        fontWeight: '500',
    },
    confirmText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
