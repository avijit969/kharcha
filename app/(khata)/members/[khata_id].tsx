import { StyleSheet } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { RootState } from '@/store/store'
import { useSelector } from 'react-redux'
import { Image } from 'react-native'
import { Member } from '@/features/khata/membersSclice'
import Button from '@/components/Button'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'

const AllMembers = () => {
    const { khata_id } = useLocalSearchParams()
    const khataMembersState = useSelector((state: RootState) => state.khata_members.khata_members)

    const members = khataMembersState.find(k => k.khata_id === khata_id)?.members || []

    const activeMembers = members
    console.log('members', JSON.stringify(members, null, 2))
    const [invitedMembers, setInvitedMembers] = React.useState<Member[]>([])
    const router = useRouter()
    const fetchInvitedMembers = async () => {
        const { data, error } = await supabase
            .from('invites')
            .select('status, users:invited_to_id(id, full_name, avatar)')
            .eq('khata_id', khata_id)
        if (error) {
            console.error('Error fetching invited members:', error)
        } else {
            console.log('Invited members:', data)
            setInvitedMembers(data.map((invite: any) => ({
                id: invite.users.id,
                full_name: invite.users.full_name,
                avatar: invite.users.avatar,
                role: invite.status,
            })))
        }
    }
    React.useEffect(() => {
        fetchInvitedMembers()
    }, [])
    const renderMember = (member: Member) => (
        <ThemedView key={member.id} style={styles.memberCard}>
            <Image source={{ uri: member.avatar }} style={styles.avatar} />
            <ThemedText style={styles.name}>{member.full_name} </ThemedText>
            {member.role === 'admin' && (
                <ThemedText style={styles.name}>({member.role})</ThemedText>
            )}
        </ThemedView>
    )

    return (
        <ScreenWrapper>
            <ThemedView style={styles.container}>
                <Header name="Members" />
                <ThemedText style={styles.heading}>All Members</ThemedText>
                {activeMembers.length > 0 ? (
                    activeMembers.map(renderMember)
                ) : (
                    <ThemedText style={styles.emptyText}>No active members found</ThemedText>
                )}

                <ThemedText style={styles.heading}>Invited Members</ThemedText>
                {invitedMembers.length > 0 ? (
                    invitedMembers.map(renderMember)
                ) : (
                    <ThemedText style={styles.emptyText}>No invited members</ThemedText>
                )}

                {/* Invite members button */}
                <Button
                    title="Invite Members"
                    onPress={() => {
                        router.push(`/(khata)/invite_member/${khata_id}` as any);
                    }}
                    style={{ marginTop: 20 }}
                />
            </ThemedView>
        </ScreenWrapper>
    )
}

export default AllMembers

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    memberCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    name: {
        fontSize: 16,
    },
    emptyText: {
        padding: 10,
        color: '#888',
    },
})
