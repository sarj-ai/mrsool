"use client";
import "@livekit/components-styles";

import { Button } from "@/components/ui/button";
import { LiveKitRoom } from "@livekit/components-react";
import { useState } from "react";
import { closeRoom, getParticipantToken } from "./actions/get-token";
import Room from "./room";

export default function LiveKit() {
  const [isWaiting, setIsWaiting] = useState(true);
  const [token, setToken] = useState("");
  const [room, setRoom] = useState("");
  if (isWaiting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="space-y-6 text-center">
          <h1 className="text-3xl font-bold tracking-tighter">Join Meeting</h1>
          <p className="text-muted-foreground">
            Click below to join the video conference
          </p>
          <Button
            size="lg"
            onClick={async () => {
              const { token: newToken, room: newRoom } =
                await getParticipantToken();
              setToken(newToken);
              setRoom(newRoom);
              setIsWaiting(false);
            }}
          >
            Join Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      data-lk-theme="default"
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      video={false}
      audio={true}
      onDisconnected={async () => {
        setToken("");
        setRoom("");
        setIsWaiting(true);

        // close room
        await closeRoom(room);
      }}
    >
      <Room />
    </LiveKitRoom>
  );
}
