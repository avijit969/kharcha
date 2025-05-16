import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import store from '@/store/store';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [appIsReady, setAppIsReady] = useState(false);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (url) {
        router.push(url);
      }
    }
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log(notification);
      redirect(notification);
    });
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
      redirect(response.notification);
    });
    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
      });
      setAppIsReady(true);
      return () => {
        listener.subscription.unsubscribe();
      };
    };
    initAuth();
  }, []);

  useEffect(() => {
    const checkReady = async () => {
      if (loaded && appIsReady) {
        await SplashScreen.hideAsync();
        setTimeout(() => {
          if (session) {
            router.replace("/home");
          } else {
            router.replace("/welcome");
          }
        }, 0);
      }
    };

    checkReady();
  }, [loaded, appIsReady, session]);

  if (!loaded || !appIsReady) {
    return null;
  }

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <GestureHandlerRootView>
          <BottomSheetModalProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/forgot-password" options={{ headerShown: false }} />
              <Stack.Screen name="welcome" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen name='(khata)/invite_member/[khata_id]' options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </Provider>
  );
}
