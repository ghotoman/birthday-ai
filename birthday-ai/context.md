# BirthdayAI — Контекст проекта

> Этот файл отслеживает текущее состояние проекта, принятые решения и выполненную работу.
> Обновляется после каждого значимого изменения.

---

## Стек

| Слой | Технология | Версия |
|------|-----------|--------|
| Фреймворк | Expo (React Native) | SDK 54 |
| Роутинг | Expo Router | v6 |
| Язык | TypeScript (strict) | 5.9 |
| Стейт | Zustand | latest |
| Персистенция | AsyncStorage | latest |
| AI Gateway | OpenRouter API | — |
| AI модели | GPT-4o, GPT-4o-mini, Claude 3.5 Sonnet, Claude 3 Haiku, Gemini 2.0 Flash, Llama 3.1 70B, Mistral Large | через OpenRouter |
| Иконки | @expo/vector-icons (Ionicons) | — |
| Даты | date-fns | latest |
| Clipboard | expo-clipboard | — |
| Haptics | expo-haptics | — |
| Контакты | expo-contacts | — |
| OAuth | expo-auth-session + expo-web-browser | — |
| Уведомления | expo-notifications | — |
| Date Picker | @react-native-community/datetimepicker | — |
| Файловая система | expo-file-system + expo-media-library | — |
| Шаринг файлов | expo-sharing | — |

---

## Структура файлов

```
birthday-ai/
├── app/                         # Expo Router — экраны
│   ├── _layout.tsx              # Root layout (Stack + ThemeProvider)
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigator (5 табов)
│   │   ├── index.tsx            # Главная: ближайшие ДР, карусель, CTA
│   │   ├── contacts.tsx         # Контакты: поиск, фильтр по группам, список
│   │   ├── calendar.tsx         # Календарь: сетка месяца с маркерами ДР, список по дате
│   │   ├── history.tsx          # История поздравлений
│   │   └── settings.tsx         # Настройки: выбор модели AI, импорт
│   ├── contact/
│   │   ├── edit/
│   │   │   └── [id].tsx         # Редактирование контакта (модал)
│   ├── contact/
│   │   ├── new.tsx              # Создание контакта (модал)
│   │   └── [id].tsx             # Детали контакта + прошлые поздравления
│   ├── generate/
│   │   └── [contactId].tsx      # Flow генерации (анкета → AI → результат)
│   └── import.tsx               # Экран импорта (VK, OK, Контакты) — одна кнопка на источник
│
├── components/
│   ├── ui/                      # Базовые UI-компоненты
│   │   ├── Avatar.tsx           # Аватар с инициалами/фото
│   │   ├── Badge.tsx            # Бейдж с вариантами цветов
│   │   ├── Button.tsx           # Кнопка (primary/secondary/outline/ghost, sm/md/lg)
│   │   ├── Card.tsx             # Карточка с тенью и опциональным onPress
│   │   ├── EmptyState.tsx       # Пустое состояние с эмодзи, текстом и CTA
│   │   ├── Input.tsx            # Текстовое поле с label, error, hint, иконкой
│   │   ├── ShareBar.tsx          # Панель шаринга (Telegram, WhatsApp, VK, OK, Copy, Share)
│   │   ├── DatePicker.tsx       # Нативный date picker (iOS modal + Android spinner)
│   │   └── index.ts             # Реэкспорт
│   ├── calendar/
│   │   └── BirthdayCalendar.tsx # Календарь-сетка с навигацией по месяцам, маркерами ДР, списком
│   ├── contacts/
│   │   └── ContactCard.tsx      # Карточка контакта (аватар, имя, обратный отсчёт, теги)
│   ├── home/
│   │   └── UpcomingCarousel.tsx  # Горизонтальная карусель ближайших ДР
│   └── generator/
│       └── QuestionCard.tsx     # Карточка вопроса с вариантами ответов
│
├── constants/
│   ├── Colors.ts                # Палитра + Light/Dark темы
│   └── Theme.ts                 # Типографика, спейсинги, borderRadius, тени
│
├── hooks/
│   ├── useColors.ts             # Хук для получения цветов текущей темы
│   └── index.ts
│
├── stores/
│   ├── contactsStore.ts         # Zustand: CRUD контактов + атрибуты + AsyncStorage
│   └── greetingsStore.ts        # Zustand: история поздравлений + AsyncStorage
│
├── services/
│   ├── ai.ts                    # OpenRouter API: buildPrompt + generateGreeting + generateMultiple + AI_MODELS
│   ├── cards.ts                 # Генерация открыток: DALL-E через бэкенд, сохранение, шаринг
│   ├── notifications.ts        # Push-уведомления: планирование по NotificationLevel, каналы
│   ├── share.ts                 # Шаринг: Telegram, WhatsApp, VK, OK, нативный share sheet, копирование
│   └── social/                  # Импорт контактов из соцсетей
│       ├── config.ts            # APP_ID для VK и OK (заменить на свои)
│       ├── vk.ts                # VK OAuth + friends.get с bdate → Contact[]
│       ├── ok.ts                # OK OAuth + users.getInfo с birthday → Contact[]
│       ├── device.ts            # expo-contacts → контакты с ДР
│       └── index.ts             # Реэкспорт
│
├── types/
│   ├── contact.ts               # Contact, ContactAttribute, GroupType, ToneType, etc.
│   └── greeting.ts              # Greeting, QuestionnaireAnswers, GreetingFormat
│
├── utils/
│   └── dates.ts                 # getAge, daysUntilBirthday, formatBirthday, склонения
│
├── assets/                      # Шрифты, иконки, сплэш
├── app.json                     # Expo конфиг
├── tsconfig.json                # TS strict, paths: @/* → ./*
└── package.json
```

---

## Выполненные фазы

### Фаза 0: Подготовка — DONE
- [x] Git репозиторий инициализирован
- [x] Expo проект создан (SDK 54, tabs template)
- [x] Зависимости установлены (zustand, async-storage, date-fns, expo-haptics, expo-clipboard, uuid)
- [x] Дизайн-система: палитра (коралл/фиолет/золото), типографика (iOS HIG), тени, спейсинги
- [x] 6 базовых UI-компонентов: Button, Card, Avatar, Badge, Input, EmptyState
- [x] TypeScript strict: 0 ошибок

### Фаза 1: MVP Core Flow — DONE
- [x] Главный экран: ближайшие ДР (карусель), сегодняшние ДР (акцентный блок), быстрые действия
- [x] Список контактов: поиск, фильтрация по группам, сортировка по близости ДР
- [x] CRUD контактов: имя, дата, группа, тон, уведомления, атрибуты
- [x] Атрибуты контакта: хобби, черта характера, воспоминание, шутка, прозвище
- [x] Flow генерации: 4-шаговая анкета (тон → формат → шутки про возраст → заметка)
- [x] Интеграция OpenAI GPT-4o-mini с настраиваемым промптом
- [x] Экран результата: текст, копирование, перегенерация, смена тона
- [x] История поздравлений: лента с бейджами тона, копирование
- [x] Настройки: ввод/сохранение API ключа
- [x] Dark/Light тема (auto по системе)
- [x] Haptic feedback на ключевых действиях

---

### Фаза 2: Открытки + Уведомления + UX — DONE
- [x] Генерация открыток (DALL-E через OpenRouter, кнопка на экране результата)
- [x] Push-уведомления (expo-notifications, локальные по расписанию)
- [x] Приоритеты уведомлений привязаны к NotificationLevel контакта (week/3days/day_before/same_day/none)
- [x] Скачивание открыток в галерею + шаринг через нативный share sheet
- [x] Нативный date picker (iOS modal spinner, Android spinner) вместо текстового ввода
- [x] Редактирование существующего контакта (экран edit/[id])
- [x] Календарь — таб с сеткой по месяцам и маркерами ДР

---

## Что НЕ сделано (следующие фазы)

### Фаза 3: Соцсети и импорт
- [x] VK OAuth + импорт друзей с датами ДР
- [x] OK OAuth + импорт
- [ ] Импорт из календаря устройства (expo-calendar)
- [x] Импорт из контактов устройства (expo-contacts)
- [x] Дедупликация (по source+sourceId и по имя+дата)
- [ ] Фоновая синхронизация

### Фаза 4: Polish и монетизация
- [ ] Онбординг с анимациями (Lottie)
- [x] ~~Множественные нейросети на выбор~~ — реализовано через OpenRouter (7 моделей)
- [ ] Premium подписка (RevenueCat)
- [ ] Стриминг генерации (typewriter эффект)
- [x] ~~Перенос API ключа на бэкенд~~ — бэкенд создан, клиент поддерживает оба режима
- [x] ~~Нативный Share sheet~~ + прямой шаринг в Telegram/WhatsApp/VK/OK
- [ ] Виджет на home screen

### Фаза 5: Beta и запуск
- [ ] TestFlight / Google Play Internal
- [ ] ASO
- [ ] Публикация

---

## Принятые решения

| # | Решение | Причина |
|---|---------|---------|
| 1 | Expo SDK 54 + Expo Router v6 | Один кодбейс iOS/Android, file-based routing, OTA updates |
| 2 | Zustand вместо Redux/MobX | Минимальный бойлерплейт, идеально для MVP |
| 3 | AsyncStorage для персистенции | Достаточно для MVP, потом можно мигрировать на SQLite |
| 4 | API ключ ТОЛЬКО на сервере | Клиент не знает ключ — всё через бэкенд `/api/generate` |
| 5 | OpenRouter вместо прямых API | Единый ключ для всех моделей, пользователь выбирает модель в настройках |
| 6 | gpt-4o-mini как дефолтная модель | Быстрее и дешевле gpt-4o, достаточно для поздравлений |
| 6 | Ionicons вместо FontAwesome | Более modern look, лучше fit для iOS/Android |
| 7 | date-fns вместо moment/dayjs | Tree-shakeable, русская локаль из коробки |
| 8 | Дата как строка YYYY-MM-DD | Проще сериализация, без проблем с таймзонами |
| 9 | Тёплая палитра (коралл/фиолет) | Дружелюбный, праздничный вид для birthday-приложения |
| 10 | Модал для создания контакта | Быстрое действие без потери контекста |

---

## Известные ограничения

- URL бэкенда зашит в `constants/Api.ts` — перед билдом заменить на свой
- Нет анимаций при переходах между шагами генерации
- Нет offline fallback при недоступности API
- Фото контактов не поддерживаются (только инициалы)
- Генерация открыток зависит от поддержки images API в OpenRouter

---

## Последнее обновление

**Дата:** 2026-02-06
**Что сделано:** Фаза 2 полностью завершена:
- Нативный date picker (iOS/Android) вместо текстового ввода даты
- Редактирование контактов (экран edit/[id] + кнопка на странице контакта)
- Push-уведомления: автоматическое планирование по NotificationLevel, Android-канал, навигация по нажатию
- Генерация AI-открыток (DALL-E через бэкенд), сохранение в галерею, шаринг
- Календарь-таб с сеткой по месяцам
- Бэкенд работает по IP без домена
