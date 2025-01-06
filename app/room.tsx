"use client";
import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/lib/language-context";
import {
  BarVisualizer,
  RoomAudioRenderer,
  useDataChannel,
  useVoiceAssistant,
  VoiceAssistantControlBar,
} from "@livekit/components-react";
import "@livekit/components-styles";
import type { PutBlobResult } from "@vercel/blob";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from "react-markdown";

export default function Room() {
  const [urlInput, setUrlInput] = useState("");
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const { send } = useDataChannel("chat", (msg) =>
    console.log("message received", msg)
  );
  const { t, language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const lastTranscription = agentTranscriptions.at(-1);
  const isRTL = language === "ar";

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <LanguageSelector />
      <div className="h-80 mb-8">
        <BarVisualizer state={state} barCount={5} trackRef={audioTrack} />
      </div>
      <div className="mb-8">
        <VoiceAssistantControlBar />
      </div>
      <RoomAudioRenderer />

      <div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Upload</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
              <DialogDescription>
                Upload a file to analyze its contents
              </DialogDescription>
            </DialogHeader>
            <FileUploadForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">{t("transcriptions")}</h3>
        {lastTranscription && (
          <div className="bg-gray-800/50 p-4 rounded-md">
            <div dir={isRTL ? "rtl" : "ltr"}>
              <ReactMarkdown className="prose prose-invert">
                {lastTranscription.text}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FileUploadForm({ onSuccess }: { onSuccess: () => void }) {
  const { send } = useDataChannel("chat", (msg) =>
    console.log("message received", msg)
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file type
      const allowedTypes = ["application/pdf", "text/plain"];
      if (!allowedTypes.includes(file.type)) {
        setUploadError("Only PDF and TXT files are allowed");
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const response = await fetch(`/api/upload?filename=${file.name}`, {
          method: "POST",
          body: file,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const newBlob = (await response.json()) as PutBlobResult;

        console.log("newBlob", newBlob);

        send(
          new TextEncoder().encode(
            JSON.stringify({
              action: "analyzeUrl",
              payload: { url: newBlob.url },
            })
          ),
          { topic: "file" }
        );

        onSuccess();
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError(
          error instanceof Error ? error.message : "Upload failed"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [send, onSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
    },
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-muted-foreground/25"
        }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <p className="text-muted-foreground">Uploading...</p>
        ) : isDragActive ? (
          <p className="text-primary">Drop the file here</p>
        ) : (
          <div className="space-y-2">
            <p>Drag and drop a file here, or click to select</p>
            <p className="text-sm text-muted-foreground">
              Supports .txt and .pdf files
            </p>
          </div>
        )}
      </div>
      {uploadError && (
        <p className="text-sm text-destructive text-center">{uploadError}</p>
      )}
    </div>
  );
}
