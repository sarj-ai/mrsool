"use client";
import { LanguageSelector } from "@/components/language-selector";
import { useLanguage } from "@/lib/language-context";
import {
  BarVisualizer,
  RoomAudioRenderer,
  useVoiceAssistant,
  VoiceAssistantControlBar,
} from "@livekit/components-react";
import "@livekit/components-styles";
import ReactMarkdown from "react-markdown";

export default function Room() {
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const { t, language } = useLanguage();

  const lastTranscription = agentTranscriptions.at(-1);
  const isRTL = language === "ar";

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <LanguageSelector />
      <div className="h-80 mb-8">
        <BarVisualizer state={state} barCount={5} trackRef={audioTrack} />
      </div>
      <div className="mb-8">
        <VoiceAssistantControlBar />
      </div>
      <RoomAudioRenderer />


      <div className="rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">{t("transcriptions")}</h3>
        {lastTranscription && (
          <div className="bg-gray-800/50 p-4 rounded-md">
            <div dir={isRTL ? "rtl" : "ltr"}>
              <ReactMarkdown className="prose prose-invert">
                {lastTranscription.text}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
