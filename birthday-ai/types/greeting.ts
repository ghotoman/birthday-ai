import { ToneType } from './contact';

export type GreetingFormat = 'short' | 'long' | 'poem';
export type GenerationStatus = 'idle' | 'generating' | 'done' | 'error';

export interface QuestionnaireAnswers {
  tone: ToneType;
  format: GreetingFormat;
  mentionAge: boolean;
  ageJokesOk: boolean;
  customNote: string;
  includeCard: boolean;
}

export interface Greeting {
  id: string;
  contactId: string;
  contactName: string;
  greetingText: string;
  cardImageUrl?: string;
  tone: ToneType;
  format: GreetingFormat;
  aiProvider: string;
  questionnaire: QuestionnaireAnswers;
  year: number;
  sharedVia: string[];
  createdAt: string;
}

export const FORMAT_LABELS: Record<GreetingFormat, string> = {
  short: 'Коротко и ёмко',
  long: 'Развёрнуто',
  poem: 'Стихи',
};

export const FORMAT_DESCRIPTIONS: Record<GreetingFormat, string> = {
  short: '2-3 предложения',
  long: '5-7 предложений',
  poem: '4-8 строк',
};
