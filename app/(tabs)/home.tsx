import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState, useEffect } from 'react';
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
  const khata = useSelector((state: RootState) => state.khata);
  useEffect(() => {
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

    fetchUserDetails()
  }, [])
  useEffect(() => {
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

    getAllKhata();
  }, []);

  return (
    <ScreenWrapper>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.headerText}>
            Welcome to Kharcha!
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <View style={styles.profileIcon}>
              {user.user.avatar ? (
                <Image
                  source={{ uri: user.user.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <Ionicons name="person-outline" size={24} color="black" style={{ margin: 10 }} />
              )}

            </View>
          </TouchableOpacity>
        </ThemedView>

        <ThemedText style={styles.title}>Your khatas are available here.</ThemedText>

        <ScrollView>
          {loading ? (
            [1, 2].map((_, i) => (
              <ShimmerPlaceholder
                key={i}
                style={{
                  height: hp(30),
                  borderRadius: 10,
                  marginVertical: 10,
                  width: '100%',
                }}
              />
            ))
          ) : (
            khata.map((khataItem) => (
              <KhataCard
                key={khataItem.id}
                data={khataItem as KhataData}
              />
            ))
          )}
          {!loading && khata.length === 0 && (
            <ThemedText style={{ textAlign: 'center', marginTop: hp(20), fontSize: 16, fontWeight: 'bold' }}>
              You don't have any khata or you are not a member of any khata
            </ThemedText>
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
    flexDirection: 'column',
    flex: 1,
    gap: hp(2),
    padding: wp(2),
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    paddingBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileIcon: {
    backgroundColor: 'white',
    borderRadius: 50,
    borderWidth: 1,
  },
});
