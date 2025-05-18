import { StyleSheet, ToastAndroid } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { KhataData } from '@/app/(tabs)/home';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import Button from '@/components/Button';
import { addKhata } from '@/features/khata/khataSlice';

type Invite = {
    id: string;
    invited_to_id: string;
    khata_id: string;
    invited_by_id: string;
    status: string;
    created_at?: string;
    updated_at?: string;
    users: {
        full_name: string;
        avatar?: string;
    }
    khata: KhataData
}

const AcceptInvite = () => {
    const { invite_id } = useLocalSearchParams();
    const authUser = useSelector((state: RootState) => state.user.user);
    const [inviteDetails, setInviteDetails] = useState<Invite | null>(null);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        const getInviteDetails = async () => {
            const { data, error } = await supabase
                .from('invites')
                .select('*, khata:khata_id(name), users:invited_to_id(full_name, avatar)')
                .eq('id', invite_id)
                .single();

            if (error) {
                ToastAndroid.show(error.message, ToastAndroid.SHORT);
                return;
            }

            setInviteDetails({
                ...data,
                users: Array.isArray(data.users) ? data.users[0] : data.users,
                khata: Array.isArray(data.khata) ? data.khata[0] : data.khata,
            });
        };

        getInviteDetails();
    }, [invite_id]);

    const handleAcceptInvite = async () => {
        if (!inviteDetails || !authUser) return;

        setLoading(true);

        // 1. Update invite status to "accepted"
        const { error: updateError } = await supabase
            .from('invites')
            .update({ status: 'accepted' })
            .eq('id', inviteDetails.id);

        if (updateError) {
            ToastAndroid.show(updateError.message, ToastAndroid.SHORT);
            setLoading(false);
            return;
        }

        // 2. Insert into members table
        const { error: insertError } = await supabase
            .from('members')
            .insert({
                user_id: inviteDetails.invited_to_id,
                khata_id: inviteDetails.khata_id,
                role: 'user'
            });

        if (insertError) {
            ToastAndroid.show(insertError.message, ToastAndroid.SHORT);
            setLoading(false);
            return;
        }
        //3. save khata in khata store
        const findKhataById = async () => {
            const { data, error } = await supabase
                .from('khata')
                .select('*, users(full_name, avatar)')
                .eq('id', inviteDetails.khata_id)
                .single();
            if (error) {
                ToastAndroid.show(error.message, ToastAndroid.SHORT);
            } else {
                dispatch(addKhata(data));
            }
        }
        findKhataById();
        ToastAndroid.show('Invite accepted!', ToastAndroid.SHORT);
        setInviteDetails({ ...inviteDetails, status: 'accepted' });
        setLoading(false);
    };

    if (!inviteDetails) return null;

    return (
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
                Hey {authUser?.full_name}, you have been invited to join "{inviteDetails.khata.name}"
            </ThemedText>

            {inviteDetails.status === 'pending' ? (
                <Button
                    title={loading ? 'Accepting...' : 'Accept Invitation'}
                    onPress={handleAcceptInvite}
                />
            ) : (
                <ThemedText style={{ marginTop: 20, color: 'green' }}>
                    ✅ You have already accepted this invite.
                </ThemedText>
            )}
        </ThemedView>
    );
};

export default AcceptInvite;

const styles = StyleSheet.create({});
