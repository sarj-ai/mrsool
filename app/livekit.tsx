"use client";
import "@livekit/components-styles";

import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { LiveKitRoom } from "@livekit/components-react";
import { useState } from "react";
import { closeRoom, getParticipantToken } from "./actions/get-token";
import Room from "./room";

export default function LiveKit() {
  const [isWaiting, setIsWaiting] = useState(true);
  const [token, setToken] = useState("");
  const [room, setRoom] = useState("");
  const { language, t } = useLanguage();

  if (isWaiting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LanguageSelector />
        <div className="space-y-6 text-center">
          <h1 className="text-3xl font-bold tracking-tighter">
            {t("joinMeeting")}
          </h1>
          <p className="text-muted-foreground">{t("joinDescription")}</p>
          <Button
            size="lg"
            onClick={async () => {
              const { token: newToken, room: newRoom } =
                await getParticipantToken(language);
              setToken(newToken);
              setRoom(newRoom);
              setIsWaiting(false);
            }}
          >
            {t("joinNow")}
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
