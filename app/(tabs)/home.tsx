import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
  StatusBar as RNStatusBar
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { hp, wp } from '@/helpers/common';
import { Ionicons } from '@expo/vector-icons';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import KhataCard from '@/components/KhataCard';
import CreateKhata from '@/components/CreateKhata';
import { supabase } from '@/lib/supabase';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { setKhata } from '@/features/khata/khataSlice';
import { Image } from 'expo-image';
import { setUser } from '@/features/user/userSclice';
import { theme } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme.web';

export type KhataData = {
  id: string | number;
  name: string;
  cover_image: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  users: {
    full_name: string;
    avatar: string;
  };
};

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const Home = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const khata = useSelector((state: RootState) => state.khata);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fetchUserDetails = async () => {
    const session = await supabase.auth.getSession()
    const authUser = session.data.session?.user
    if (authUser) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
      if (data) {
        dispatch(setUser(data))
      }
    }
  }

  const getAllKhata = async () => {
    setLoading(true);

    const userResponse = await supabase.auth.getUser();

    if (!userResponse.data.user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('members')
      .select(`
          khata:khata_id(id, name, cover_image, description, created_by, created_at, updated_at),
          users:user_id(id,full_name, avatar,expo_push_token)
        `)
      .eq('user_id', userResponse.data.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setLoading(false);
      return;
    }

    if (data) {
      const transformedKhata: KhataData[] = data.map((item: any) => ({
        id: item.khata.id,
        name: item.khata.name,
        cover_image: item.khata.cover_image,
        description: item.khata.description,
        created_by: item.khata.created_by,
        created_at: item.khata.created_at,
        updated_at: item.khata.updated_at,
        users: {
          full_name: item.users.full_name,
          avatar: item.users.avatar,
        },
      }));
      dispatch(setKhata(transformedKhata));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUserDetails()
    getAllKhata();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getAllKhata();
    setRefreshing(false);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScreenWrapper>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ThemedView style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.greetingText}>{getGreeting()},</ThemedText>
            <ThemedText style={styles.userNameText}>
              {user.user.full_name?.split(' ')[0] || 'User'} 👋
            </ThemedText>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Image
              source={user.user.avatar ? { uri: user.user.avatar } : require('@/assets/images/icon.png')} // Fallback if no avatar
              style={styles.avatar}
              contentFit="cover"
            />
          </TouchableOpacity>
        </View>

        {/* Dashboard Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Quick Stats or Promo Banner could go here */}

          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>My Khatas</ThemedText>
            {/* <ThemedText style={styles.seeAll}>See All</ThemedText> */}
          </View>

          {loading ? (
            [1, 2, 3].map((_, i) => (
              <ShimmerPlaceholder
                key={i}
                style={styles.shimmerCard}
              />
            ))
          ) : (
            <View style={styles.cardsContainer}>
              {khata.map((khataItem) => (
                <View key={khataItem.id} style={styles.cardWrapper}>
                  <KhataCard
                    data={khataItem as KhataData}
                  />
                </View>
              ))}
            </View>
          )}

          {!loading && khata.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={60} color={isDark ? '#444' : '#ccc'} />
              <ThemedText style={styles.emptyText}>
                No Khatas Found
              </ThemedText>
              <ThemedText style={styles.emptySubText}>
                Create a new one to start tracking expenses!
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </ThemedView>

      <CreateKhata />
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(10),
    paddingHorizontal: wp(4),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    marginBottom: hp(1),
  },
  greetingText: {
    fontSize: wp(4),
    color: '#888',
    fontFamily: 'Inter_400Regular',
  },
  userNameText: {
    fontSize: wp(5),
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  avatar: {
    width: hp(6),
    height: hp(6),
    borderRadius: hp(3),
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: wp(5),
    fontWeight: '700',
  },
  seeAll: {
    color: theme.colors.primary,
    fontSize: wp(3.5),
  },
  cardsContainer: {
    gap: hp(2),
  },
  cardWrapper: {
    // Wrapper to add spacing or shadow if needed outside the component
  },
  shimmerCard: {
    height: hp(22),
    borderRadius: 16,
    marginBottom: hp(2),
    width: '100%',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(10),
    gap: 10,
  },
  emptyText: {
    fontSize: wp(5),
    fontWeight: '600',
    color: '#888',
  },
  emptySubText: {
    fontSize: wp(3.5),
    color: '#aaa',
    textAlign: 'center',
    maxWidth: '70%',
  },
});
