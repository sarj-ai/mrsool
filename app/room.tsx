"use client";
import "@livekit/components-styles";

import { Button } from "@/components/ui/button";
import {
  BarVisualizer,
  Chat,
  RoomAudioRenderer,
  useDataChannel,
  useLocalParticipant,
  useVoiceAssistant,
  VoiceAssistantControlBar,
} from "@livekit/components-react";
import { RpcError, RpcInvocationData } from "livekit-client";
import { useEffect } from "react";

export default function Room() {
  // Send messages to all participants via the 'chat' topic.
  const { message: latestMessage, send } = useDataChannel("chat", (msg) =>
    console.log("message received", msg)
  );

  console.log("latestMessage", latestMessage);
  const { state, audioTrack } = useVoiceAssistant();

  const { localParticipant } = useLocalParticipant();
  useEffect(() => {
    if (localParticipant) {
      localParticipant.registerRpcMethod(
        "getUserLocation",
        async (data: RpcInvocationData) => {
          try {
            const params = JSON.parse(data.payload);
            const position: GeolocationPosition = await new Promise(
              (resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: params.highAccuracy ?? false,
                  timeout: data.responseTimeout,
                });
              }
            );

            return JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          } catch {
            throw new RpcError(1, "Could not retrieve user location");
          }
        }
      );
    }
  }, [localParticipant]);

  return (
    <>
      <div className="h-80">
        <BarVisualizer state={state} barCount={5} trackRef={audioTrack} />
      </div>
      <VoiceAssistantControlBar />
      <RoomAudioRenderer />
      <Chat />
      <Button
        onClick={() => {
          console.log("sending message");
          send(
            new TextEncoder().encode(
              JSON.stringify({
                action: "doSomething",
                payload: { key: "value" },
              })
            ),
            { topic: "file" }
          );
        }}
      >
        Send
      </Button>
    </>
  );
}
