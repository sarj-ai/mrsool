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
import dotenv from "dotenv";
import { RoomEvent } from "livekit-client";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "../.env.local");
dotenv.config({ path: envPath });

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();
    console.log("waiting for participant");
    const participant = await ctx.waitForParticipant();
    console.log(`starting assistant example agent for ${participant.identity}`);

    const model = new openai.realtime.RealtimeModel({
      instructions: `You are an helpful assistant. You can do two different things. 
      You can tell the user the weather when they ask (use weather function) AND
      You can disucss any provided document with the user (use openDocumentPopup function). Calling the function will open a popup on the users screen`,
    });

    const fncCtx: llm.FunctionContext = {
      openDocumentPopup: {
        description: `Open a document popup on the user's screen. The screen has a textfield where the user 
can past a URL that contrains document you (the assistant) will later discuss with the user.

The function will return a JSON object with the following fields:
- success: boolean - whether the document was successfully opened
- message: string - a message to the user (you as assistant should way that in your words to the user!)
- documentText: string - the text of the document

`,
        parameters: z.object({}),
        execute: async () => {
          console.log("Opening document popup on the users screen");
          try {
            const urlText = await ctx.room.localParticipant!.performRpc({
              destinationIdentity: participant.identity,
              method: "openDocumentPopup",
              payload: JSON.stringify({}),
              responseTimeout: 60_000, //we can wait up to 1 min get a response form the user
            });

            if (!urlText) {
              return JSON.stringify({
                success: false,
                message:
                  "No URL was provided. Please try again and paste a valid document URL.",
                documentText: "",
              });
            }

            console.log("User entered URL:", urlText);

            try {
              const url = new URL(urlText);
              console.log("User entered valid URL:", url);

              if (!url.pathname.endsWith(".txt")) {
                return JSON.stringify({
                  success: false,
                  message:
                    "Only .txt files are currently supported. Please provide a URL to a .txt file.",
                  documentText: "",
                });
              }

              const response = await fetch(url);
              if (!response.ok) {
                return JSON.stringify({
                  success: false,
                  message: `Unable to fetch the document. Please check if the URL is accessible and try again.`,
                  documentText: "",
                });
              }

              const text = await response.text();
              console.log("Successfully downloaded document text");

              return JSON.stringify({
                success: true,
                message:
                  "I've successfully loaded the document and am ready to discuss it with you.",
                documentText: text,
              });
            } catch (error) {
              console.error("Error fetching document:", error);
              console.log("User entered invalid URL:", urlText);
              return JSON.stringify({
                success: false,
                message:
                  "The URL provided appears to be invalid. Please provide a valid URL to a .txt file.",
                documentText: "",
              });
            }
          } catch (error) {
            console.error("Error opening document popup:", error);
            return JSON.stringify({
              success: false,
              message:
                "Something went wrong while processing your request. Please try again.",
              documentText: "",
            });
          }
        },
      },

      getUserLocation: {
        description: "Retrieve the user's current geolocation as lat/lng.",
        parameters: z.object({
          highAccuracy: z
            .boolean()
            .describe("Whether to use high accuracy mode, which is slower"),
        }),
        execute: async (params) => {
          try {
            return await ctx.room.localParticipant!.performRpc({
              destinationIdentity: participant.identity,
              method: "getUserLocation",
              payload: JSON.stringify(params),
              responseTimeout: params.highAccuracy ? 10000 : 5000,
            });
          } catch {
            return "Unable to retrieve user location";
          }
        },
      },
      weather: {
        description: "Get the weather in a location",
        parameters: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        execute: async ({ location }) => {
          console.debug(`executing weather function for ${location}`);
          const response = await fetch(
            `https://wttr.in/${location}?format=%C+%t`
          );
          if (!response.ok) {
            throw new Error(`Weather API returned status: ${response.status}`);
          }
          const weather = await response.text();
          return `The weather in ${location} right now is ${weather}.`;
        },
      },
    };

    const agent = new multimodal.MultimodalAgent({ model, fncCtx });

    agent.on("agent_started_speaking", () => {
      console.log("Agent started speaking.");
    });

    ctx.room.on(RoomEvent.DataReceived, (payload, participant, kind) => {
      console.log("Received message:", new TextDecoder().decode(payload));
      console.log("From participant:", participant?.identity);
      console.log("Message type:", kind); // reliable/unreliable
    });

    const session = await agent
      .start(ctx.room, participant)
      .then((session) => session as openai.realtime.RealtimeSession);

    // session.chatCtx.send(
    //   new TextEncoder().encode(
    //     JSON.stringify({
    //       action: "doSomething",
    //       payload: { key: "value" },
    //     })
    //   ),
    //   { topic: "chat" }
    // );

    session.conversation.item.create(
      llm.ChatMessage.create({
        role: llm.ChatRole.ASSISTANT,
        text: 'Say "How can I help you today you cool guy?"',
      })
    );

    session.response.create();
  },
});

cli.runApp(
  new WorkerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: "Document Bot",
  })
);
