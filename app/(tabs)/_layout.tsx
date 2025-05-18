import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { wp } from '@/helpers/common';
import { theme } from '@/constants/theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { ThemedView } from '@/components/ThemedView';
import { View } from 'react-native';
import { Text } from 'react-native';
import { supabase } from '@/lib/supabase';
import { setNotifications } from '@/features/notification/notificationSclice';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const dispatch = useDispatch();
  // load the notification
  const authUser = useSelector((state: RootState) => state.user.user)
  useEffect(() => {
    const loadNotifications = async () => {
      const { data, error } = await supabase.from('notifications').select('*').eq('user_id', authUser.id);
      console.log("notifications", data);
      if (error) {
        console.log("erroe", error);
      }
      dispatch(setNotifications(data));
    };
    loadNotifications();
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
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="analytics-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: 'Notification',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 30, height: 30, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons size={28} name="notifications-outline" color={color} />
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
