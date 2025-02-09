"use client";
import "@livekit/components-styles";

import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/language-context";
import { LineItem } from "@/lib/types";
import { LiveKitRoom } from "@livekit/components-react";
import { useState } from "react";
import { closeRoom, getParticipantToken } from "./actions/get-token";
import Room from "./room";

export default function LiveKit() {
  const [isWaiting, setIsWaiting] = useState(true);
  const [token, setToken] = useState("");
  const [room, setRoom] = useState("");
  const { language, t } = useLanguage();

  // Form state
  const [storeNumber, setStoreNumber] = useState("");
  const [storeName, setStoreName] = useState("");
  const [items, setItems] = useState<LineItem[]>([{
    name: "",
    description: "",
  }]);

  const addItem = () => {
    setItems([...items, { name: "", description: "" }]);
  };

  const updateItem = (index: number, field: keyof LineItem, value: string) => {
    const newItems = items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  if (isWaiting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LanguageSelector />
        <div className="space-y-6 text-center">
          <h1 className="text-3xl font-bold tracking-tighter">
            {t("joinMeeting")}
          </h1>
          <p className="text-muted-foreground">{t("joinDescription")}</p>

          <div className="w-full max-w-sm mx-auto space-y-4">
            <Input
              placeholder="Store Number"
              value={storeNumber}
              onChange={(e) => setStoreNumber(e.target.value)}
            />
            <Input
              placeholder="Store Name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Item Name"
                      value={item.name}
                      onChange={(e) =>
                        updateItem(index, "name", e.target.value)}
                    />
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        removeItem(index)}
                      className="shrink-0"
                      type="button"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="w-full"
              >
                Add Item
              </Button>
            </div>
          </div>

          <Button
            size="lg"
            onClick={async () => {
              const { token: newToken, room: newRoom } =
                await getParticipantToken(
                  language,
                  storeNumber,
                  storeName,
                  items.filter((item) => item.name || item.description), // Only send non-empty items
                );
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
