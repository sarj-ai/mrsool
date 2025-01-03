"use client";
import "@livekit/components-styles";

import { Button } from "@/components/ui/button";
import { LiveKitRoom } from "@livekit/components-react";
import { useState } from "react";
import Room from "./room";

export default function LiveKit({ token }: { token: string }) {
  const [isWaiting, setIsWaiting] = useState(true);

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
            onClick={() => {
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
      onDisconnected={() => {
        setIsWaiting(true);
      }}
    >
      <Room />
    </LiveKitRoom>
  );
}
