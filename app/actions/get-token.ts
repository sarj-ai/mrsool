"use server";

import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol";
import { AccessToken } from "livekit-server-sdk";

export async function getParticipantToken() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Server misconfigured");
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: String(Math.random()).slice(2), // Generate a random identity
  });

  at.addGrant({
    // room: `my-room-10`,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  at.roomConfig = new RoomConfiguration({
    agents: [
      new RoomAgentDispatch({
        agentName: "doc-bot",
      }),
    ],
  });

  return await at.toJwt();
}
