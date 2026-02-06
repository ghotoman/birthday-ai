export default {
  // Tabs
  tabs: {
    home: 'Home',
    contacts: 'Contacts',
    calendar: 'Calendar',
    history: 'History',
    settings: 'Settings',
  },

  // Home
  home: {
    title: 'BirthdayAI',
    todayBirthday: "It's someone's birthday today!",
    congratulate: 'Congratulate',
    addContact: 'Add',
    import: 'Import',
    upcoming: 'Coming up',
    emptyTitle: 'No contacts yet',
    emptyDescription: 'Add your first friend to never forget a birthday',
    emptyAction: 'Add contact',
  },

  // Contacts
  contacts: {
    search: 'Search...',
    all: 'All',
    family: 'Family',
    closeFriends: 'Close',
    friends: 'Friends',
    colleagues: 'Colleagues',
    acquaintances: 'Other',
    noContacts: 'No contacts',
    nothingFound: 'Nothing found',
    noContactsDesc: 'Add friends to never miss a birthday',
    nothingFoundDesc: 'Try changing the filter or search query',
    addContact: 'Add contact',
  },

  // Calendar
  calendar: {
    emptyTitle: 'Calendar is empty',
    emptyDescription: 'Add contacts to see birthdays in the calendar',
    addContact: 'Add contact',
    birthdaysInMonth: 'birthdays this month',
    allBirthdays: 'All birthdays in',
    noBirthdays: 'No birthdays on',
    turnsYears: 'turns',
    years: 'years old',
  },

  // History
  history: {
    emptyTitle: 'Nothing here yet',
    emptyDescription: 'Your greeting history will appear here',
  },

  // Settings
  settings: {
    aiModel: 'AI MODEL',
    general: 'GENERAL',
    notifications: 'Notifications',
    notificationsDesc: 'Set birthday reminders',
    importContacts: 'Import contacts',
    importContactsDesc: 'VK, OK, Phone contacts',
    theme: 'App theme',
    themeDesc: 'Auto (system)',
    language: 'Language',
    languageDesc: 'English',
    about: 'ABOUT',
    version: 'Version 1.0.0',
  },

  // Contact form
  contactForm: {
    newContact: 'New contact',
    editContact: 'Edit',
    name: 'Name',
    namePlaceholder: 'John Smith',
    birthday: 'Birthday',
    birthdayPlaceholder: 'Select birthday',
    group: 'Group',
    defaultTone: 'Default tone',
    notifications: 'Notifications',
    attributes: 'Attributes',
    attributesHint: 'Add details for a more personal greeting',
    attrPlaceholder: 'E.g.: plays guitar',
    save: 'Save',
    saveChanges: 'Save changes',
    errorName: 'Please enter a name',
    errorBirthday: 'Please select a birthday',
  },

  // Contact detail
  contactDetail: {
    notFound: 'Contact not found',
    congratulateToday: 'Congratulate! 🎉',
    prepareGreeting: 'Prepare greeting',
    deleteTitle: 'Delete contact?',
    deleteMessage: 'will be deleted',
    cancel: 'Cancel',
    delete: 'Delete',
    attributes: 'Attributes',
    pastGreetings: 'Past greetings',
    turnsAge: 'turns',
  },

  // Generation
  generate: {
    toneQuestion: 'What tone?',
    forContact: 'For',
    formatQuestion: 'What format?',
    ageJokesQuestion: 'Age jokes allowed?',
    turnsAge: 'Turning',
    ageJokesYes: 'Yes, go for it 🔥',
    ageJokesYesDesc: 'Age is a great topic for jokes',
    ageJokesNo: 'Better not',
    ageJokesNoDesc: "Let's skip age jokes",
    customNoteTitle: 'Anything else?',
    customNoteHint: 'Mention something specific or leave empty',
    customNotePlaceholder: 'E.g.: recently came back from Japan...',
    generateButton: 'Generate! ✨',
    generating: 'Generating greeting...',
    generatingHint: 'AI is choosing the right words',
    greetingFor: 'Greeting for',
    regenerate: 'Regenerate',
    changeTone: 'Change tone',
    error: 'Error',
    tryAgain: 'Try again',
    generateCard: 'Generate card 🎨',
    retryCard: 'Try again 🎨',
    drawingCard: 'Drawing card...',
    saveCard: 'Save',
    shareCard: 'Share',
    cardSaved: 'Done',
    cardSavedMsg: 'Card saved to gallery',
    cardError: 'Error',
    cardErrorMsg: 'No permission to save to gallery',
    shareError: 'Failed to share card',
  },

  // Import
  import: {
    title: 'Import contacts',
    vk: 'Import from VK',
    ok: 'Import from Odnoklassniki',
    device: 'Import from contacts',
  },

  // Groups
  groups: {
    family: 'Family',
    close_friend: 'Close friends',
    friend: 'Friends',
    colleague: 'Colleagues',
    acquaintance: 'Acquaintances',
  },

  // Tones
  tones: {
    warm: 'Warm',
    funny: 'Funny',
    sarcastic: 'Sarcastic',
    formal: 'Formal',
    roast: 'Roast',
  },

  toneDescriptions: {
    warm: 'Heartfelt and sincere',
    funny: 'Fun and cheerful',
    sarcastic: 'With irony and teasing',
    formal: 'Polite and respectful',
    roast: 'Bold and witty',
  },

  // Formats
  formats: {
    short: 'Short & sweet',
    long: 'Detailed',
    poem: 'Poem',
  },

  formatDescriptions: {
    short: '2-3 sentences',
    long: '5-7 sentences',
    poem: '4-8 lines',
  },

  // Notifications
  notificationLevels: {
    week: 'Week before + day before',
    '3days': '3 days before + same day',
    day_before: 'Day before',
    same_day: 'Same day',
    none: 'No notifications',
  },

  // Attributes
  attributeLabels: {
    hobby: 'Hobby',
    trait: 'Personality trait',
    memory: 'Shared memory',
    joke: 'Inside joke',
    nickname: 'Nickname',
    other: 'Other',
  },

  // Push notifications
  push: {
    todayTitle: "🎂 It's their birthday!",
    todayBody: (name: string, age: number) =>
      `${name} turns ${age} today! Don't forget to congratulate`,
    tomorrowTitle: '🎁 Birthday tomorrow',
    tomorrowBody: (name: string, age: number) =>
      `${name} turns ${age} tomorrow. Prepare a greeting!`,
    in3daysTitle: '📅 Birthday in 3 days',
    in3daysBody: (name: string, age: number) =>
      `${name} turns ${age} soon`,
    inNdaysTitle: (n: number) => `📅 Birthday in ${n} days`,
    inNdaysBody: (name: string, age: number) =>
      `${name} turns ${age} soon. Time to prepare a greeting!`,
  },

  // Date-related
  dates: {
    today: 'Today! 🎉',
    tomorrow: 'Tomorrow',
    inDays: (n: number) => `In ${n}`,
  },

  // Language picker
  langPicker: {
    title: 'Выбери язык',
    subtitle: 'Choose your language',
    continue: 'Continue',
  },
} as const;
