"use server";

import { AccessToken } from "livekit-server-sdk";

export async function getParticipantToken() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Server misconfigured");
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: String(Math.random()).slice(2), // Generate a random identity
    ttl: 60 * 60 * 2, // 2 hours in seconds
  });

  at.addGrant({
    room: `my-room-3`,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  return at.toJwt();
}
