export const translations = {
  en: {
    joinMeeting: "Join Meeting",
    joinDescription: "Click below to join the video conference",
    joinNow: "Join Now",
    enterUrl: "Upload a document to analyze...",
    analyzeUrl: "Analyze Document",
    transcriptions: "Transcriptions:",
    sayPrefix: "SAY: ",
    doneAnalyzing: "Done analyzing",
    analyzingNow: "Analyzing now",
    errorFetchingDocument:
      "Unable to process the document. Please check if the file is valid and try again.",
    invalidUrl:
      "The file appears to be invalid. Please provide a valid document.",
    unsupportedFileType:
      "Only .txt and .pdf files are currently supported. Please upload a .txt or .pdf file.",
    noUrlProvided:
      "No document was uploaded. Please try again and upload a valid document.",
    generalError:
      "Something went wrong while processing your request. Please try again.",
    systemInstruction: `You are an helpful assistant. You can do two different things. 
You can tell the user the weather when they ask (use weather function) AND
If the user wants to discuss a document, they will upload it via a separate form and the server will then analyze it. 

After the server has analyzed it, you can use the search() function to request parts of the document.

Please keep your intro short and concise.

IMPORTANT: Always respond in English, regardless of the language the user writes in.`,
  },
  de: {
    joinMeeting: "Meeting beitreten",
    joinDescription: "Klicken Sie unten, um an der Videokonferenz teilzunehmen",
    joinNow: "Jetzt beitreten",
    enterUrl: "Dokument zum Analysieren hochladen...",
    analyzeUrl: "Dokument analysieren",
    transcriptions: "Transkriptionen:",
    sayPrefix: "SAGE: ",
    doneAnalyzing: "Analyse abgeschlossen",
    analyzingNow: "Wird jetzt analysiert",
    errorFetchingDocument:
      "Das Dokument konnte nicht verarbeitet werden. Bitte überprüfen Sie, ob die Datei gültig ist, und versuchen Sie es erneut.",
    invalidUrl:
      "Die Datei scheint ungültig zu sein. Bitte laden Sie ein gültiges Dokument hoch.",
    unsupportedFileType:
      "Nur .txt- und .pdf-Dateien werden derzeit unterstützt. Bitte laden Sie eine .txt- oder .pdf-Datei hoch.",
    noUrlProvided:
      "Es wurde kein Dokument hochgeladen. Bitte versuchen Sie es erneut und laden Sie ein gültiges Dokument hoch.",
    generalError:
      "Bei der Verarbeitung Ihrer Anfrage ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
    systemInstruction: `Du bist ein hilfreicher Assistent. Du kannst zwei verschiedene Dinge tun.
Du kannst dem Benutzer das Wetter mitteilen, wenn er danach fragt (Wetterfunktion verwenden) UND
Wenn der Benutzer ein Dokument besprechen möchte, lädt er es über ein separates Formular hoch und der Server analysiert es dann.

Nachdem der Server es analysiert hat, kannst du die search()-Funktion verwenden, um Teile des Dokuments anzufordern.

Bitte halte deine Einführung kurz und prägnant.

WICHTIG: Antworte immer auf Deutsch, unabhängig davon, in welcher Sprache der Benutzer schreibt.`,
  },
  ar: {
    joinMeeting: "انضم إلى الاجتماع",
    joinDescription: "انقر أدناه للانضمام إلى مؤتمر الفيديو",
    joinNow: "انضم الآن",
    enterUrl: "قم بتحميل مستند للتحليل...",
    analyzeUrl: "تحليل المستند",
    transcriptions: "النصوص المكتوبة:",
    sayPrefix: "قُل: ",
    doneAnalyzing: "اكتمل التحليل",
    analyzingNow: "يتم التحليل الآن",
    errorFetchingDocument:
      "تعذر معالجة المستند. يرجى التحقق من صحة الملف والمحاولة مرة أخرى.",
    invalidUrl: "يبدو أن الملف غير صالح. يرجى تقديم مستند صالح.",
    unsupportedFileType:
      "يتم دعم ملفات .txt و .pdf فقط حاليًا. يرجى تحميل ملف .txt أو .pdf.",
    noUrlProvided:
      "لم يتم تحميل أي مستند. يرجى المحاولة مرة أخرى وتحميل مستند صالح.",
    generalError: "حدث خطأ أثناء معالجة طلبك. حاول مرة اخرى.",
    systemInstruction: `أنت مساعد مفيد. يمكنك القيام بشيئين مختلفين.
يمكنك إخبار المستخدم عن حالة الطقس عندما يسأل (استخدم وظيفة الطقس) و
إذا أراد المستخدم مناقشة مستند، فسيقوم بتحميله عبر نموذج منفصل وسيقوم الخادم بتحليله.

بعد أن يحلله الخادم، يمكنك استخدام وظيفة search() لطلب أجزاء من المستند.

يرجى الحفاظ على مقدمتك قصيرة وموجزة.

مهم: قم دائمًا بالرد باللغة العربية، بغض النظر عن اللغة التي يكتب بها المستخدم.`,
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];
