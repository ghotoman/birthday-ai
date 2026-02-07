import { Contact } from '@/types/contact';
import { QuestionnaireAnswers } from '@/types/greeting';
import { getUpcomingAge } from '@/utils/dates';
import { TONE_LABELS } from '@/types/contact';
import { API_BASE_URL } from '@/constants/Api';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing' ;

/**
 * Генерация промпта для открытки
 */
function buildCardPrompt(contact: Contact, answers: QuestionnaireAnswers): string {
  const age = getUpcomingAge(contact.birthday);
  const tone = TONE_LABELS[answers.tone];

  return `Create a beautiful birthday greeting card illustration.
Style: modern, colorful, festive, warm.
Mood: ${tone}.
Requirements:
- Birthday celebration theme with balloons, confetti, cake or gifts
- The number "${age}" can be artistically incorporated as a decorative element
- Warm and inviting color palette with gradients
- Professional quality, suitable for sharing on social media
- Clean, modern design with plenty of visual appeal
Do NOT include any written text, letters, or words in the image. Only decorative elements and illustrations.`;
}

export interface CardGenerationResult {
  imageUrl: string;
  localUri?: string;
}

/**
 * Сгенерировать открытку через AI
 */
export async function generateCard(
  contact: Contact,
  answers: QuestionnaireAnswers
): Promise<CardGenerationResult> {
  const prompt = buildCardPrompt(contact, answers);

  const response = await fetch(`${API_BASE_URL}/api/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      size: '1024x1024',
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ошибка генерации открытки: ${response.status}`);
  }

  const data = await response.json();

  if (!data.data || !data.data[0] || !data.data[0].url) {
    throw new Error('Не удалось получить изображение');
  }

  const imageUrl: string = data.data[0].url;

  // Скачиваем картинку локально
  const filename = `birthday_card_${contact.id}_${Date.now()}.png`;
  const localUri = `${FileSystem.cacheDirectory}${filename}`;

  if (imageUrl.startsWith('data:image/')) {
    // base64 data URL — извлекаем чистый base64
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
    await FileSystem.writeAsStringAsync(localUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } else if (imageUrl.startsWith('http')) {
    await FileSystem.downloadAsync(imageUrl, localUri);
  } else {
    // Чистый base64 без префикса
    await FileSystem.writeAsStringAsync(localUri, imageUrl, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  return { imageUrl, localUri };
}

/**
 * Сохранить открытку в галерею
 */
export async function saveCardToGallery(localUri: string): Promise<boolean> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    return false;
  }

  await MediaLibrary.saveToLibraryAsync(localUri);
  return true;
}

/**
 * Поделиться открыткой
 */
export async function shareCard(localUri: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Шаринг не доступен на этом устройстве');
  }
  await Sharing.shareAsync(localUri, {
    mimeType: 'image/png',
    dialogTitle: 'Поделиться открыткой',
  });
}
