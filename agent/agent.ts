// SPDX-FileCopyrightText: 2024 LiveKit, Inc.
//
// SPDX-License-Identifier: Apache-2.0
import {
  type JobContext,
  WorkerOptions,
  cli,
  defineAgent,
  llm,
  multimodal,
} from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import { JobType } from "@livekit/protocol";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

import { translations } from "@/lib/translations";
import { Language, LineItem } from "@/lib/types";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "../.env.local");
dotenv.config({ path: envPath });


export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();
    console.log("waiting for participant");
    const participant = await ctx.waitForParticipant();
    console.log(`starting assistant example agent for ${participant.identity}`);

    // extract the users language from the metadata
    let language: Language = "en";
    const metadata = ctx.job?.metadata;
    if (metadata) {
      try {
        const meta = JSON.parse(metadata) as {
          language: Language;
          storeName: string,
          phoneNumber: string,
          menuItems: LineItem[]

        };
        language = meta.language;
      } catch (error) {
        console.error("Error parsing metadata", error);
      }
    }

    console.log("language", language);

    // when the agent is down. this should also close the room
    ctx.addShutdownCallback(async () => {
      console.log("shutting down agent");
    });


    const fncCtx: llm.FunctionContext = {
      weather: {
        description: "Get the weather in a location",
        parameters: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        execute: async ({ location }) => {
          console.debug(`executing weather function for ${location}`);

          // TODO translate the location to english. This seem to work better
          const response = await fetch(
            `https://wttr.in/${encodeURIComponent(location)}?format=%C+%t`
          );
          if (!response.ok) {
            throw new Error(`Weather API returned status: ${response.status}`);
          }
          const weather = await response.text();
          return `The weather in ${location} right now is ${weather}.`;
        },
      },
    };

    const model = new openai.realtime.RealtimeModel({
      model: "gpt-4o-realtime-preview-2024-12-17",
      instructions: translations[language].systemInstruction,
      maxResponseOutputTokens: Infinity,
      temperature: 0.6,
    });

    const agent = new multimodal.MultimodalAgent({ model, fncCtx });
    const session = await agent
      .start(ctx.room, participant)
      .then((session) => session as openai.realtime.RealtimeSession);

    agent.on("agent_started_speaking", () => {
      console.log("Agent started speaking.");
    });


    session.response.create();
  },
});

cli.runApp(
  new WorkerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: "mrsool-outbound", // IMPORTANT: If you do set a name, the agent will not auto join any room! https://docs.livekit.io/agents/build/dispatch/
    workerType: JobType.JT_ROOM,
    numIdleProcesses: 4,
    port: Number(process.env.PORT) || 8080, // this actually the health check port
    host: "0.0.0.0",
  })
);
