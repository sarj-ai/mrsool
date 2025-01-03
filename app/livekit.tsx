"use client";

import { Button } from "@/components/ui/button";
import { AudioConference, LiveKitRoom } from "@livekit/components-react";
import "@livekit/components-styles";
import { useState } from "react";

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
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      video={true}
      audio={true}
    >
      <AudioConference />
    </LiveKitRoom>
  );
}
