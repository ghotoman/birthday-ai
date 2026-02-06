import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useContactsStore } from '@/stores/contactsStore';
import {
  requestNotificationPermissions,
  rescheduleAllNotifications,
} from '@/services/notifications';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Загрузка контактов и настройка уведомлений
  const contacts = useContactsStore((s) => s.contacts);
  const contactsLoaded = useContactsStore((s) => s.loaded);
  const loadContacts = useContactsStore((s) => s.loadContacts);

  useEffect(() => {
    loadContacts();
    requestNotificationPermissions();
  }, []);

  // Переплаировать уведомления при изменении контактов
  useEffect(() => {
    if (contactsLoaded && contacts.length > 0) {
      rescheduleAllNotifications(contacts);
    }
  }, [contactsLoaded, contacts]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const notifResponseListener = useRef<Notifications.EventSubscription>();

  // При нажатии на уведомление — открыть контакт
  useEffect(() => {
    notifResponseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.contactId) {
          router.push(`/contact/${data.contactId}`);
        }
      });

    return () => {
      if (notifResponseListener.current) {
        Notifications.removeNotificationSubscription(notifResponseListener.current);
      }
    };
  }, []);

  // Custom themes matching our design system
  const lightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  const darkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? darkTheme : lightTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="contact/new"
          options={{
            presentation: 'modal',
            title: 'Новый контакт',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.text, fontWeight: '600' },
          }}
        />
        <Stack.Screen
          name="contact/[id]"
          options={{
            title: '',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.primary,
          }}
        />
        <Stack.Screen
          name="contact/edit/[id]"
          options={{
            presentation: 'modal',
            title: 'Редактировать',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.text, fontWeight: '600' },
          }}
        />
        <Stack.Screen
          name="generate/[contactId]"
          options={{
            presentation: 'modal',
            headerShown: false,
            title: 'Генерация',
          }}
        />
        <Stack.Screen
          name="import"
          options={{
            presentation: 'modal',
            title: 'Импорт контактов',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.text, fontWeight: '600' },
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
