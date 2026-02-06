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
The card should feature:
- Birthday celebration theme with balloons, confetti, or cake
- Beautiful typography area for the text "С Днём Рождения!" (Happy Birthday in Russian)
- The number "${age}" prominently displayed
- Warm and inviting color palette
- No actual text in the image, just decorative elements
- Professional quality, suitable for sharing on social media
Do NOT include any written text or letters in the image.`;
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

  if (!data.data || !data.data[0]) {
    throw new Error('Не удалось получить изображение');
  }

  const imageUrl = data.data[0].url || data.data[0].b64_json;

  // Скачиваем картинку локально
  const filename = `birthday_card_${contact.id}_${Date.now()}.png`;
  const localUri = `${FileSystem.cacheDirectory}${filename}`;

  if (imageUrl.startsWith('http')) {
    await FileSystem.downloadAsync(imageUrl, localUri);
  } else {
    // base64
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
