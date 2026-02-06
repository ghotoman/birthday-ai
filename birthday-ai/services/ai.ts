import { Contact } from '@/types/contact';
import { QuestionnaireAnswers } from '@/types/greeting';
import { getUpcomingAge } from '@/utils/dates';
import { TONE_LABELS, ATTRIBUTE_LABELS } from '@/types/contact';
import { FORMAT_LABELS } from '@/types/greeting';
import { API_BASE_URL } from '@/constants/Api';

// Доступные модели
export const AI_MODELS = {
  'openai/gpt-4o-mini': { label: 'GPT-4o Mini', provider: 'OpenAI', emoji: '🟢' },
  'openai/gpt-4o': { label: 'GPT-4o', provider: 'OpenAI', emoji: '🟢' },
  'anthropic/claude-3.5-sonnet': { label: 'Claude 3.5 Sonnet', provider: 'Anthropic', emoji: '🟠' },
  'anthropic/claude-3-haiku': { label: 'Claude 3 Haiku', provider: 'Anthropic', emoji: '🟠' },
  'google/gemini-2.0-flash-001': { label: 'Gemini 2.0 Flash', provider: 'Google', emoji: '🔵' },
  'meta-llama/llama-3.1-70b-instruct': { label: 'Llama 3.1 70B', provider: 'Meta', emoji: '🟣' },
  'mistralai/mistral-large': { label: 'Mistral Large', provider: 'Mistral', emoji: '🔴' },
} as const;

export type AIModelId = keyof typeof AI_MODELS;

export const DEFAULT_MODEL: AIModelId = 'openai/gpt-4o-mini';

export interface GenerateOptions {
  contact: Contact;
  answers: QuestionnaireAnswers;
  model?: AIModelId;
}

function buildPrompt(contact: Contact, answers: QuestionnaireAnswers): string {
  const age = getUpcomingAge(contact.birthday);
  const attrs = contact.attributes
    .map((a) => `${ATTRIBUTE_LABELS[a.category]}: ${a.value}`)
    .join('\n');

  return `Ты — креативный копирайтер, специализирующийся на поздравлениях с днём рождения. Пиши на русском языке.

Контекст:
- Имя именинника: ${contact.name}
- Возраст: ${age}
- Тон: ${TONE_LABELS[answers.tone]}
- Формат: ${FORMAT_LABELS[answers.format]}
- Можно шутить про возраст: ${answers.ageJokesOk ? 'Да' : 'Нет'}
${attrs ? `- Атрибуты:\n${attrs}` : ''}
${answers.customNote ? `- Дополнительный контекст: ${answers.customNote}` : ''}

Правила:
1. Поздравление должно быть уникальным и личным
2. Используй предоставленные атрибуты органично, не перечисляй их
3. Строго соблюдай выбранный тон
4. Не используй банальные клише ("счастья, здоровья, успехов" — только если это ирония)
5. Если тон дерзкий/саркастический — будь остроумным, но не обидным
6. Формат: ${answers.format === 'short' ? '2-3 предложения' : answers.format === 'long' ? '5-7 предложений' : 'стихи 4-8 строк'}

Напиши одно поздравление. Без вступлений и пояснений — сразу текст поздравления.`;
}

export async function generateGreeting({
  contact,
  answers,
  model = DEFAULT_MODEL,
}: GenerateOptions): Promise<string> {
  const prompt = buildPrompt(contact, answers);

  const response = await fetch(`${API_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ошибка сервера: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

/**
 * Генерация нескольких вариантов параллельно
 */
export async function generateMultiple(
  options: GenerateOptions,
  count: number = 3
): Promise<string[]> {
  const promises = Array.from({ length: count }, () =>
    generateGreeting(options)
  );
  return Promise.allSettled(promises).then((results) =>
    results
      .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
      .map((r) => r.value)
  );
}
