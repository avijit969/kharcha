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

  const [loading, setLoading] = useState<boolean>(true);
  const khata = useSelector((state: RootState) => state.khata);

  useEffect(() => {
    const getAllKhata = async () => {
      setLoading(true);

      const userResponse = await supabase.auth.getUser();

      if (!userResponse.data.user) {
        console.error('User not found');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('members')
        .select(`
          khata:khata_id(id, name, cover_image, description, created_by, created_at, updated_at),
          users:user_id(full_name, avatar)
        `)
        .eq('user_id', userResponse.data.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching khata data:', error.message);
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
        console.log('khata data', transformedKhata);
      }

      setLoading(false);
    };

    getAllKhata();
  }, [dispatch]);

  return (
    <ScreenWrapper>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.headerText}>
            Welcome to Kharcha!
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <View style={styles.profileIcon}>
              <Ionicons name="person-outline" size={24} color="black" />
            </View>
          </TouchableOpacity>
        </ThemedView>

        <ThemedText>Your khatas are available here.</ThemedText>

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
                data={khataItem}
              />
            ))
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
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileIcon: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 50,
    borderWidth: 1,
  },
});
