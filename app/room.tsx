"use client";
import { LanguageSelector } from "@/components/language-selector";
import { useLanguage } from "@/lib/language-context";
import {
  BarVisualizer,
  RoomAudioRenderer,
  useDataChannel,
  useVoiceAssistant,
  VoiceAssistantControlBar,
} from "@livekit/components-react";
import "@livekit/components-styles";
import type { PutBlobResult } from "@vercel/blob";
import { useRef, useState } from "react";
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

      <div>
        <AvatarUploadPage />
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

function AvatarUploadPage() {
  const { send } = useDataChannel("chat", (msg) =>
    console.log("message received", msg)
  );
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  return (
    <>
      <h1>Upload Your Avatar</h1>

      <form
        onSubmit={async (event) => {
          event.preventDefault();

          if (!inputFileRef.current?.files) {
            throw new Error("No file selected");
          }

          const file = inputFileRef.current.files[0];

          const response = await fetch(`/api/upload?filename=${file.name}`, {
            method: "POST",
            body: file,
          });

          const newBlob = (await response.json()) as PutBlobResult;

          console.log("newBlob", newBlob);

          send(
            new TextEncoder().encode(
              JSON.stringify({
                action: "analyzeUrl",
                payload: { url: newBlob.url },
              })
            ),
            { topic: "file" }
          );

          setBlob(newBlob);
        }}
      >
        <input name="file" ref={inputFileRef} type="file" required />
        <button type="submit">Upload</button>
      </form>
      {blob && (
        <div>
          Blob url: <a href={blob.url}>{blob.url}</a>
        </div>
      )}
    </>
  );
}
