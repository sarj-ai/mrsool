"use client";
import "@livekit/components-styles";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AudioConference,
  useDataChannel,
  useVoiceAssistant,
} from "@livekit/components-react";
import { useState } from "react";

export default function Room() {
  const [urlInput, setUrlInput] = useState("");

  // Send messages to all participants via the 'chat' topic.
  const { message: latestMessage, send } = useDataChannel("chat", (msg) =>
    console.log("message received", msg)
  );

  console.log("latestMessage", latestMessage);
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();

  console.log("state", state);

  if (state === "disconnected") {
    return <>No agent around!</>;
  }

  const lastTranscription = agentTranscriptions.at(-1);

  return (
    <>
      {/* <div className="h-80">
        <BarVisualizer state={state} barCount={5} trackRef={audioTrack} />
      </div> */}
      {/* <VoiceAssistantControlBar /> */}
      {/* <RoomAudioRenderer /> */}
      <AudioConference />
      <div className="flex gap-2 p-4">
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
      <div className="p-4 space-y-2">
        <h3 className="font-semibold">Transcriptions:</h3>
        {lastTranscription && (
          <div className="p-2  rounded">
            <p>{lastTranscription.text}</p>
          </div>
        )}
      </div>
    </>
  );
}
