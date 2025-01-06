export const translations = {
  en: {
    joinMeeting: "Join Meeting",
    joinDescription: "Click below to join the video conference",
    joinNow: "Join Now",
    enterUrl: "Enter URL to analyze...",
    analyzeUrl: "Analyze URL",
    transcriptions: "Transcriptions:",
    sayPrefix: "SAY: ",
    doneAnalyzing: "Done analyzing",
    analyzingNow: "Analyzing now",
    errorFetchingDocument:
      "Unable to fetch the document. Please check if the URL is accessible and try again.",
    invalidUrl:
      "The URL provided appears to be invalid. Please provide a valid URL to a .txt file.",
    unsupportedFileType:
      "Only .txt and .pdf files are currently supported. Please provide a URL to a .txt or .pdf file.",
    noUrlProvided:
      "No URL was provided. Please try again and paste a valid document URL.",
    generalError:
      "Something went wrong while processing your request. Please try again.",
    systemInstruction: `You are an helpful assistant. You can do two different things. 
You can tell the user the weather when they ask (use weather function) AND
If the user want to discuss a document, he/she will add it via a separate form and the server will then analyze it. 

After the server has analyzed it, you can use the search() function to request parts of the document.

Please keep your intro short and concise.

IMPORTANT: Always respond in English, regardless of the language the user writes in.`,
  },
  de: {
    joinMeeting: "Meeting beitreten",
    joinDescription: "Klicken Sie unten, um an der Videokonferenz teilzunehmen",
    joinNow: "Jetzt beitreten",
    enterUrl: "URL zum Analysieren eingeben...",
    analyzeUrl: "URL analysieren",
    transcriptions: "Transkriptionen:",
    sayPrefix: "SAGE: ",
    doneAnalyzing: "Analyse abgeschlossen",
    analyzingNow: "Wird jetzt analysiert",
    errorFetchingDocument:
      "Das Dokument konnte nicht abgerufen werden. Bitte überprüfen Sie, ob die URL zugänglich ist, und versuchen Sie es erneut.",
    invalidUrl:
      "Die angegebene URL scheint ungültig zu sein. Bitte geben Sie eine gültige URL zu einer .txt-Datei an.",
    unsupportedFileType:
      "Nur .txt- und .pdf-Dateien werden derzeit unterstützt. Bitte geben Sie eine URL zu einer .txt- oder .pdf-Datei an.",
    noUrlProvided:
      "Es wurde keine URL angegeben. Bitte versuchen Sie es erneut und fügen Sie eine gültige Dokument-URL ein.",
    generalError:
      "Bei der Verarbeitung Ihrer Anfrage ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
    systemInstruction: `Du bist ein hilfreicher Assistent. Du kannst zwei verschiedene Dinge tun.
Du kannst dem Benutzer das Wetter mitteilen, wenn er danach fragt (Wetterfunktion verwenden) UND
Wenn der Benutzer ein Dokument besprechen möchte, fügt er es über ein separates Formular hinzu und der Server analysiert es dann.

Nachdem der Server es analysiert hat, kannst du die search()-Funktion verwenden, um Teile des Dokuments anzufordern.

Bitte halte deine Einführung kurz und prägnant.

WICHTIG: Antworte immer auf Deutsch, unabhängig davon, in welcher Sprache der Benutzer schreibt.`,
  },
  ar: {
    joinMeeting: "انضم إلى الاجتماع",
    joinDescription: "انقر أدناه للانضمام إلى مؤتمر الفيديو",
    joinNow: "انضم الآن",
    enterUrl: "أدخل عنوان URL للتحليل...",
    analyzeUrl: "تحليل URL",
    transcriptions: "النصوص المكتوبة:",
    sayPrefix: "قُل: ",
    doneAnalyzing: "اكتمل التحليل",
    analyzingNow: "يتم التحليل الآن",
    errorFetchingDocument:
      "تعذر جلب المستند. يرجى التحقق من إمكانية الوصول إلى عنوان URL والمحاولة مرة أخرى.",
    invalidUrl:
      "يبدو أن عنوان URL المقدم غير صالح. يرجى تقديم عنوان URL صالح لملف .txt.",
    unsupportedFileType:
      "يتم دعم ملفات .txt و .pdf فقط حاليًا. يرجى تقديم عنوان URL لملف .txt أو .pdf.",
    noUrlProvided:
      "لم يتم تقديم عنوان URL. يرجى المحاولة مرة أخرى ولصق عنوان URL صالح للمستند.",
    generalError: "حدث خطأ أثناء معالجة طلبك. حاول مرة اخرى.",
    systemInstruction: `أنت مساعد مفيد. يمكنك القيام بشيئين مختلفين.
يمكنك إخبار المستخدم عن حالة الطقس عندما يسأل (استخدم وظيفة الطقس) و
إذا أراد المستخدم مناقشة مستند، فسيضيفه عبر نموذج منفصل وسيقوم الخادم بتحليله.

بعد أن يحلله الخادم، يمكنك استخدام وظيفة search() لطلب أجزاء من المستند.

يرجى الحفاظ على مقدمتك قصيرة وموجزة.

مهم: قم دائمًا بالرد باللغة العربية، بغض النظر عن اللغة التي يكتب بها المستخدم.`,
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];
