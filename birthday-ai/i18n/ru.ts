export default {
  // Tabs
  tabs: {
    home: 'Главная',
    contacts: 'Контакты',
    calendar: 'Календарь',
    history: 'История',
    settings: 'Настройки',
  },

  // Home
  home: {
    title: 'BirthdayAI',
    todayBirthday: 'Сегодня день рождения!',
    congratulate: 'Поздравить',
    addContact: 'Добавить',
    import: 'Импорт',
    upcoming: 'Скоро',
    emptyTitle: 'Пока никого нет',
    emptyDescription: 'Добавь первого друга, чтобы никогда не забывать о днях рождения',
    emptyAction: 'Добавить контакт',
  },

  // Contacts
  contacts: {
    search: 'Поиск...',
    all: 'Все',
    family: 'Семья',
    closeFriends: 'Близкие',
    friends: 'Друзья',
    colleagues: 'Коллеги',
    acquaintances: 'Знакомые',
    noContacts: 'Нет контактов',
    nothingFound: 'Ничего не найдено',
    noContactsDesc: 'Добавь друзей, чтобы не забывать о днях рождения',
    nothingFoundDesc: 'Попробуй изменить фильтр или поисковый запрос',
    addContact: 'Добавить контакт',
  },

  // Calendar
  calendar: {
    emptyTitle: 'Календарь пуст',
    emptyDescription: 'Добавьте контакты, чтобы увидеть дни рождения в календаре',
    addContact: 'Добавить контакт',
    birthdaysInMonth: 'дней рождения в этом месяце',
    allBirthdays: 'Все ДР в',
    noBirthdays: 'Нет дней рождения',
    turnsYears: 'исполнится',
    years: 'лет',
  },

  // History
  history: {
    emptyTitle: 'Пока пусто',
    emptyDescription: 'Здесь будет история всех твоих поздравлений',
  },

  // Settings
  settings: {
    aiModel: 'МОДЕЛЬ ДЛЯ ГЕНЕРАЦИИ',
    general: 'ОБЩИЕ',
    notifications: 'Уведомления',
    notificationsDesc: 'Настроить напоминания о ДР',
    importContacts: 'Импорт контактов',
    importContactsDesc: 'VK, OK, Контакты телефона',
    theme: 'Тема оформления',
    themeDesc: 'Авто (по системе)',
    language: 'Язык',
    languageDesc: 'Русский',
    about: 'О ПРИЛОЖЕНИИ',
    version: 'Версия 1.0.0',
  },

  // Contact form
  contactForm: {
    newContact: 'Новый контакт',
    editContact: 'Редактировать',
    name: 'Имя',
    namePlaceholder: 'Александр Петров',
    birthday: 'Дата рождения',
    birthdayPlaceholder: 'Выбери дату рождения',
    group: 'Группа',
    defaultTone: 'Тон по умолчанию',
    notifications: 'Уведомления',
    attributes: 'Атрибуты',
    attributesHint: 'Добавь детали для более личного поздравления',
    attrPlaceholder: 'Например: играет на гитаре',
    save: 'Сохранить',
    saveChanges: 'Сохранить изменения',
    errorName: 'Введи имя',
    errorBirthday: 'Выбери дату рождения',
  },

  // Contact detail
  contactDetail: {
    notFound: 'Контакт не найден',
    congratulateToday: 'Поздравить! 🎉',
    prepareGreeting: 'Подготовить поздравление',
    deleteTitle: 'Удалить контакт?',
    deleteMessage: 'будет удалён',
    cancel: 'Отмена',
    delete: 'Удалить',
    attributes: 'Атрибуты',
    pastGreetings: 'Прошлые поздравления',
    turnsAge: 'исполнится',
  },

  // Generation
  generate: {
    toneQuestion: 'Какой тон поздравления?',
    forContact: 'Для',
    formatQuestion: 'Какой формат?',
    ageJokesQuestion: 'Возраст — тема для шуток?',
    turnsAge: 'Исполняется',
    ageJokesYes: 'Да, жги 🔥',
    ageJokesYesDesc: 'Возраст — отличная тема для шуток',
    ageJokesNo: 'Лучше нет',
    ageJokesNoDesc: 'Обойдёмся без возрастных шуток',
    customNoteTitle: 'Что-нибудь ещё?',
    customNoteHint: 'Упомяни что-то конкретное или оставь пустым',
    customNotePlaceholder: 'Например: недавно вернулся из Японии...',
    generateButton: 'Сгенерировать! ✨',
    generating: 'Генерируем поздравление...',
    generatingHint: 'Нейросеть подбирает слова',
    greetingFor: 'Поздравление для',
    regenerate: 'Перегенерировать',
    changeTone: 'Другой тон',
    error: 'Ошибка',
    tryAgain: 'Попробовать ещё',
    generateCard: 'Сгенерировать открытку 🎨',
    retryCard: 'Попробовать снова 🎨',
    drawingCard: 'Рисуем открытку...',
    saveCard: 'Сохранить',
    shareCard: 'Поделиться',
    cardSaved: 'Готово',
    cardSavedMsg: 'Открытка сохранена в галерею',
    cardError: 'Ошибка',
    cardErrorMsg: 'Нет разрешения на сохранение в галерею',
    shareError: 'Не удалось поделиться открыткой',
  },

  // Import
  import: {
    title: 'Импорт контактов',
    vk: 'Импорт из VK',
    ok: 'Импорт из Одноклассников',
    device: 'Импорт из контактов',
  },

  // Groups
  groups: {
    family: 'Семья',
    close_friend: 'Близкие друзья',
    friend: 'Друзья',
    colleague: 'Коллеги',
    acquaintance: 'Знакомые',
  },

  // Tones
  tones: {
    warm: 'Тёплый',
    funny: 'Весёлый',
    sarcastic: 'Саркастичный',
    formal: 'Формальный',
    roast: 'Дерзкий',
  },

  toneDescriptions: {
    warm: 'Душевное и искреннее',
    funny: 'Смешное и весёлое',
    sarcastic: 'С иронией и подколами',
    formal: 'Вежливо и уважительно',
    roast: 'Дерзко и остроумно',
  },

  // Formats
  formats: {
    short: 'Коротко и ёмко',
    long: 'Развёрнуто',
    poem: 'Стихи',
  },

  formatDescriptions: {
    short: '2-3 предложения',
    long: '5-7 предложений',
    poem: '4-8 строк',
  },

  // Notifications
  notificationLevels: {
    week: 'За неделю + за день',
    '3days': 'За 3 дня + в день',
    day_before: 'За день',
    same_day: 'В день',
    none: 'Без уведомлений',
  },

  // Attributes
  attributeLabels: {
    hobby: 'Хобби',
    trait: 'Черта характера',
    memory: 'Общее воспоминание',
    joke: 'Внутренняя шутка',
    nickname: 'Прозвище',
    other: 'Другое',
  },

  // Push notifications
  push: {
    todayTitle: '🎂 Сегодня день рождения!',
    todayBody: (name: string, age: number) =>
      `${name} исполняется ${age}! Не забудь поздравить`,
    tomorrowTitle: '🎁 Завтра день рождения',
    tomorrowBody: (name: string, age: number) =>
      `${name} завтра исполнится ${age}. Подготовь поздравление!`,
    in3daysTitle: '📅 Через 3 дня — день рождения',
    in3daysBody: (name: string, age: number) =>
      `${name} скоро исполнится ${age}`,
    inNdaysTitle: (n: number) => `📅 Через ${n} дней — день рождения`,
    inNdaysBody: (name: string, age: number) =>
      `${name} скоро исполнится ${age}. Время подготовить поздравление!`,
  },

  // Date-related
  dates: {
    today: 'Сегодня! 🎉',
    tomorrow: 'Завтра',
    inDays: (n: number) => `Через ${n}`,
  },

  // Language picker
  langPicker: {
    title: 'Выбери язык',
    subtitle: 'Choose your language',
    continue: 'Продолжить',
  },
} as const;
