import "@livekit/components-styles";
import { getParticipantToken } from "./actions/get-token";
import LiveKit from "./livekit";

export default async function Home() {
  const token = await getParticipantToken();

  if (!token) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <LiveKit token={token} />
    </div>
  );
}
