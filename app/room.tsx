"use client";
import "@livekit/components-styles";

import {
  BarVisualizer,
  RoomAudioRenderer,
  useLocalParticipant,
  useVoiceAssistant,
  VoiceAssistantControlBar,
} from "@livekit/components-react";
import { RpcError, RpcInvocationData } from "livekit-client";
import { useEffect } from "react";

export default function Room() {
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
      <VoiceAssistantControlBar />
      <div className="h-80">
        <BarVisualizer
          state={state}
          barCount={5}
          trackRef={audioTrack}
          style={{}}
        />
        {/* <p className="text-center">{state}</p> */}
      </div>

      <RoomAudioRenderer />
    </>
  );
}
