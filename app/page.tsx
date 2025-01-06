import "@livekit/components-styles";
import LiveKit from "./livekit";

export default async function Home() {
  return (
    <div className="min-h-screen p-8">
      <LiveKit />
    </div>
  );
}
