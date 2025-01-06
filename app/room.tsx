"use client";
import "@livekit/components-styles";

import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/language-context";
import {
  BarVisualizer,
  RoomAudioRenderer,
  useDataChannel,
  useVoiceAssistant,
  VoiceAssistantControlBar,
} from "@livekit/components-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Room() {
  const [urlInput, setUrlInput] = useState("");
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const { send } = useDataChannel("chat", (msg) =>
    console.log("message received", msg)
  );
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
      <div className="flex gap-2 mb-8">
        <Input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder={t("enterUrl")}
          className="flex-1"
          dir={isRTL ? "rtl" : "ltr"}
        />
        <Button
          onClick={() => {
            if (urlInput.trim()) {
              send(
                new TextEncoder().encode(
                  JSON.stringify({
                    action: "analyzeUrl",
                    payload: { url: urlInput.trim() },
                  })
                ),
                { topic: "file" }
              );
              setUrlInput("");
            }
          }}
        >
          {t("analyzeUrl")}
        </Button>
      </div>
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
