"use client";
import "@livekit/components-styles";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const lastTranscription = agentTranscriptions.at(-1);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
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
          placeholder="Enter URL to analyze..."
          className="flex-1"
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
          Analyze URL
        </Button>
      </div>
      <div className="rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Transcriptions:</h3>
        {lastTranscription && (
          <div className="bg-gray-800/50 p-4 rounded-md">
            <ReactMarkdown className="prose prose-invert">
              {lastTranscription.text}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
