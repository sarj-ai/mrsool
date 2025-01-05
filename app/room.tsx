"use client";
import "@livekit/components-styles";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { useEffect, useState } from "react";

export default function Room() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState("");
  const [rpcResolver, setRpcResolver] = useState<
    ((value: string) => void) | null
  >(null);
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

      localParticipant.registerRpcMethod("openDocumentPopup", async () => {
        console.log("opening document popup", "openDocumentPopup");
        return new Promise<string>((resolve) => {
          setRpcResolver(() => resolve);
          setIsDialogOpen(true);
        });
      });
    }
  }, [localParticipant]);

  const handleSubmitUrl = () => {
    if (rpcResolver) {
      rpcResolver(documentUrl);
      setRpcResolver(null);
    }
    setIsDialogOpen(false);
    setDocumentUrl("");
  };

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

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open: boolean) => {
          if (!open && rpcResolver) {
            rpcResolver("");
            setRpcResolver(null);
          }
          setIsDialogOpen(open);
          setDocumentUrl("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Document URL</DialogTitle>
            <DialogDescription>
              Please enter the document URL you want to analyze
            </DialogDescription>
          </DialogHeader>
          <Input
            type="text"
            value={documentUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDocumentUrl(e.target.value)
            }
            placeholder="https://..."
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                handleSubmitUrl();
              }
            }}
          />
          <DialogFooter>
            <Button onClick={handleSubmitUrl}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
