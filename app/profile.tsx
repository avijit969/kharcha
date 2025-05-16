import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ThemedView } from '@/components/ThemedView'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedText } from '@/components/ThemedText'
import { supabase } from '@/lib/supabase'
import Button from '@/components/Button'
import { useRouter } from 'expo-router'
interface User {
    id: string;
    email: string;
}
const profile = () => {
    const [user, setUser] = useState<User>({ id: '', email: '' })
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    useEffect(() => {
        const fetchUserDetails = async () => {
            setLoading(true)
            const session = await supabase.auth.getSession()
            const user = session.data.session?.user as User
            setUser(user)
            setLoading(false)
        }
        fetchUserDetails()

    }, [])
    if (loading) {
        return (
            <ScreenWrapper>
                <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ThemedText>Loading...</ThemedText>
                </ThemedView>
            </ScreenWrapper>
        )
    }
    return (
        <ScreenWrapper>
            <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ThemedText>
                    {`Email: ${user.email}`}
                </ThemedText>
                <Button
                    title='Logout'
                    backgroundColor={'red'}
                    onPress={async () => {
                        router.replace('/welcome')
                        await supabase.auth.signOut()
                    }}
                    style={{ width: 200, marginTop: 20 }}
                />
            </ThemedView>
        </ScreenWrapper>
    )
}

export default profile

const styles = StyleSheet.create({})