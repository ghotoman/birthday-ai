import { Alert, Linking, Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

export type ShareTarget = 'telegram' | 'whatsapp' | 'vk' | 'ok' | 'native' | 'copy';

export interface ShareTargetInfo {
  id: ShareTarget;
  label: string;
  icon: string; // Ionicons name
  color: string;
}

export const SHARE_TARGETS: ShareTargetInfo[] = [
  { id: 'telegram', label: 'Telegram', icon: 'send', color: '#26A5E4' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
  { id: 'vk', label: 'ВКонтакте', icon: 'chatbubble', color: '#0077FF' },
  { id: 'ok', label: 'OK', icon: 'ellipse', color: '#EE8208' },
  { id: 'copy', label: 'Копировать', icon: 'copy-outline', color: '#6B7280' },
  { id: 'native', label: 'Ещё...', icon: 'share-outline', color: '#6B7280' },
];

/**
 * Шаринг текста в конкретное приложение или через системный share sheet
 */
export async function shareText(text: string, target: ShareTarget): Promise<boolean> {
  const encoded = encodeURIComponent(text);

  try {
    switch (target) {
      case 'telegram': {
        // tg://msg?text= для нативного приложения
        const tgApp = `tg://msg?text=${encoded}`;
        const tgWeb = `https://t.me/share/url?text=${encoded}`;
        const canOpen = await Linking.canOpenURL(tgApp);
        await Linking.openURL(canOpen ? tgApp : tgWeb);
        return true;
      }

      case 'whatsapp': {
        const waApp = `whatsapp://send?text=${encoded}`;
        const waWeb = `https://wa.me/?text=${encoded}`;
        const canOpen = await Linking.canOpenURL(waApp);
        await Linking.openURL(canOpen ? waApp : waWeb);
        return true;
      }

      case 'vk': {
        // VK мессенджер или стена
        const vkApp = `vk://share?text=${encoded}`;
        const vkWeb = `https://vk.com/share.php?comment=${encoded}`;
        const canOpen = await Linking.canOpenURL(vkApp);
        await Linking.openURL(canOpen ? vkApp : vkWeb);
        return true;
      }

      case 'ok': {
        const okWeb = `https://connect.ok.ru/offer?url=&title=&description=${encoded}`;
        await Linking.openURL(okWeb);
        return true;
      }

      case 'copy': {
        await Clipboard.setStringAsync(text);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Скопировано!', 'Текст в буфере обмена');
        return true;
      }

      case 'native': {
        const result = await Share.share({
          message: text,
        });
        return result.action === Share.sharedAction;
      }

      default:
        return false;
    }
  } catch (err: any) {
    // Если приложение не установлено — откроем системный share
    if (target !== 'native' && target !== 'copy') {
      const result = await Share.share({ message: text });
      return result.action === Share.sharedAction;
    }
    return false;
  }
}
