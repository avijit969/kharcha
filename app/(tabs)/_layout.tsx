import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { wp } from '@/helpers/common';
import { theme } from '@/constants/theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { View } from 'react-native';
import { Text } from 'react-native';
import { supabase } from '@/lib/supabase';
import { addNotification, setNotifications } from '@/features/notification/notificationSclice';
import { Feather } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const dispatch = useDispatch();
  // load the notification
  const authUser = useSelector((state: RootState) => state.user.user)
  useEffect(() => {
    const loadNotifications = async () => {
      const { data, error } = await supabase.from('notifications').select('*').eq('user_id', authUser.id);
      if (error) {
      }
      dispatch(setNotifications(data));
    };
    loadNotifications();
    // load realtime notifications

    const channels = supabase.channel('custom-filter-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${authUser?.id}` },
        (payload) => {
          dispatch(addNotification(payload.new));
        }
      )
      .subscribe()

    return () => {
      channels.unsubscribe()
    }
  }, [authUser?.id]);
  const noficationCount = useSelector((state: RootState) => state.notification.notifications)?.filter((notification) => !notification.is_viewed).length
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {
          },
        }),
        tabBarLabelStyle: {
          fontSize: wp(3.5),
          marginBottom: 2,
          fontFamily: 'Inter_500Medium',
          fontWeight: theme.fonts.bold as any,
        },

      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Feather name='home' size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Feather name='bar-chart' size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: 'Notification',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 30, height: 30, justifyContent: 'center', alignItems: 'center' }}>
              <Feather size={28} name="bell" color={color} />
              {noficationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{noficationCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />

    </Tabs>
  );
}
const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: wp(2.5),
    fontWeight: 'bold',
  },
});
