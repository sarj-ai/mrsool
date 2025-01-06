export const translations = {
  en: {
    joinMeeting: "Join Meeting",
    joinDescription: "Click below to join the video conference",
    joinNow: "Join Now",
    enterUrl: "Enter URL to analyze...",
    analyzeUrl: "Analyze URL",
    transcriptions: "Transcriptions:",
  },
  de: {
    joinMeeting: "Meeting beitreten",
    joinDescription: "Klicken Sie unten, um an der Videokonferenz teilzunehmen",
    joinNow: "Jetzt beitreten",
    enterUrl: "URL zum Analysieren eingeben...",
    analyzeUrl: "URL analysieren",
    transcriptions: "Transkriptionen:",
  },
  ar: {
    joinMeeting: "انضم إلى الاجتماع",
    joinDescription: "انقر أدناه للانضمام إلى مؤتمر الفيديو",
    joinNow: "انضم الآن",
    enterUrl: "أدخل عنوان URL للتحليل...",
    analyzeUrl: "تحليل URL",
    transcriptions: "النصوص المكتوبة:",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];
