// SPDX-FileCopyrightText: 2024 LiveKit, Inc.
//
// SPDX-License-Identifier: Apache-2.0
import { vector } from "@electric-sql/pglite/vector";
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
import { RoomEvent } from "livekit-client";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import { readPdfText } from "pdf-text-reader";
import { z } from "zod";

import { Language } from "@/lib/types";
import { PGlite } from "@electric-sql/pglite";
import { RoomServiceClient } from "livekit-server-sdk";

const db = new PGlite({
  extensions: { vector },
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "../.env.local");
dotenv.config({ path: envPath });

// Initialize OpenAI client
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default defineAgent({
  prewarm: async () => {
    console.log("prewarming agent");
    // before the agent can start, let's make sure the RAG system works. And

    // init the DB
    await db.exec("CREATE EXTENSION IF NOT EXISTS vector;");

    await db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id bigint primary key generated always as identity,
        text TEXT,
        embedding vector(1536)
      );
    `);

    await db.exec(`
      create index on documents using hnsw (embedding vector_ip_ops);
    `);
  },
  entry: async (ctx: JobContext) => {
    await ctx.connect();
    console.log("waiting for participant");
    const participant = await ctx.waitForParticipant();
    console.log(`starting assistant example agent for ${participant.identity}`);

    // extract the users language from the metadata
    let language: Language = "en";
    const metadata = ctx.job.room?.metadata;
    if (metadata) {
      try {
        const meta = JSON.parse(metadata) as {
          language: Language;
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

      const roomServiceClient = new RoomServiceClient(
        process.env.LIVEKIT_URL!,
        process.env.LIVEKIT_API_KEY!,
        process.env.LIVEKIT_API_SECRET!
      );
      await roomServiceClient.deleteRoom(ctx.job.room!.name);
    });

    async function analyzeDocument(text: string) {
      // Function to split text into chunks of roughly equal size
      function splitIntoChunks(
        text: string,
        chunkSize: number = 1000
      ): string[] {
        const chunks: string[] = [];
        const sentences = text.split(/[.!?]+/);
        let currentChunk = "";

        for (const sentence of sentences) {
          const trimmedSentence = sentence.trim();
          if (!trimmedSentence) continue;

          if (
            (currentChunk + trimmedSentence).length > chunkSize &&
            currentChunk.length > 0
          ) {
            chunks.push(currentChunk.trim());
            currentChunk = trimmedSentence;
          } else {
            currentChunk += (currentChunk ? " " : "") + trimmedSentence;
          }
        }

        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }

        return chunks;
      }

      try {
        console.log("Starting document analysis process");

        // Split the text into chunks
        const chunks = splitIntoChunks(text);
        console.log("Created chunks", chunks.length);

        // Generate embeddings for each chunk
        const embeddingsWithText: Array<{ text: string; embedding: number[] }> =
          [];

        for (const chunk of chunks) {
          const response = await openaiClient.embeddings.create({
            model: "text-embedding-3-small",
            input: chunk,
            encoding_format: "float",
          });

          embeddingsWithText.push({
            text: chunk,
            embedding: response.data[0].embedding,
          });

          console.log(
            "Generated embedding for chunk",
            chunk.substring(0, 50) + "..."
          );
        }

        console.log(
          "Completed embedding generation",
          embeddingsWithText.length
        );

        // Insert embeddings into the database
        for (const item of embeddingsWithText) {
          console.log("Storing embedding with length:", item.embedding.length);
          await db.query(
            `INSERT INTO documents (text, embedding) VALUES ($1, $2) RETURNING id`,
            [item.text, JSON.stringify(item.embedding)]
          );
        }
        console.log("Successfully stored all embeddings in the database");

        // tell the user analysis has completed
        session.conversation.item.create(
          llm.ChatMessage.create({
            role: llm.ChatRole.ASSISTANT,
            text: `SAY: "Done analyzing"`,
          })
        );

        // Generate a response
        session.response.create();

        return embeddingsWithText;
      } catch (error) {
        console.error("Error during document analysis:", error);

        session.conversation.item.create(
          llm.ChatMessage.create({
            role: llm.ChatRole.ASSISTANT,
            text: `I encountered an error while trying to analyze the document. Please try again or contact support if the issue persists.`,
          })
        );

        session.response.create();
        throw error;
      }
    }

    const fncCtx: llm.FunctionContext = {
      search: {
        description:
          "This function will use AI (RAG) to search a document. The query parameter should be a 'Human readable search sentence'",
        parameters: z.object({
          query: z
            .string()
            .describe(
              "A Human readable search sentence. It should be perfect for RAG!"
            ),
        }),
        execute: async ({ query }) => {
          console.log(`Searching for "${query}" in the document`);

          // Generate embedding for the query
          const queryEmbedding = await openaiClient.embeddings.create({
            model: "text-embedding-3-small",
            input: query,
            encoding_format: "float",
          });

          console.log(
            "Search query embedding length:",
            queryEmbedding.data[0].embedding.length
          );

          // Let's check what's in the database first
          const countResult = await db.query<{ count: number }>(
            "SELECT COUNT(*) as count FROM documents"
          );
          console.log(
            "Total documents in database:",
            countResult.rows[0].count
          );

          const res = await db.query<{ text: string }>(
            `
            select text from documents
            order by embedding <=> $1
            limit 10;
            `,
            [JSON.stringify(queryEmbedding.data[0].embedding)]
          );

          console.log("Results:", res.rows);
          return JSON.stringify(res.rows.map((row) => row.text));
        },
      },

      analyzeDocument: {
        description:
          "Analyzes the document for the given 'url'. The function will return a JSON object with the following fields: success: boolean - whether the document was successfully analyzed, message: string - a message to the user (you as assistant should way that in your words to the user!)",
        parameters: z.object({
          url: z.string().describe("The URL of the document to analyze"),
        }),
        execute: async ({ url }) => {
          console.log(`Analyzing document at ${url}`);

          const urlText = url;

          try {
            if (!urlText) {
              return JSON.stringify({
                success: false,
                message:
                  "No URL was provided. Please try again and paste a valid document URL.",
              });
            }

            console.log("User entered URL:", urlText);

            try {
              const url = new URL(urlText);

              let extension = "";
              if (url.pathname.endsWith(".txt")) {
                extension = ".txt";
              } else if (url.pathname.endsWith(".pdf")) {
                extension = ".pdf";
              }

              if (!extension) {
                return JSON.stringify({
                  success: false,
                  message:
                    "Only .txt and .pdf files are currently supported. Please provide a URL to a .txt or .pdf file.",
                });
              }

              let text = "";
              if (extension === ".pdf") {
                text = await readPdfText({ url: url.toString() });
              } else {
                const response = await fetch(url);
                if (!response.ok) {
                  return JSON.stringify({
                    success: false,
                    message:
                      "Unable to fetch the document. Please check if the URL is accessible and try again.",
                  });
                }
                text = await response.text();
              }

              console.log(
                "Successfully downloaded and processed document",
                text.replace(/\n/g, " ").substring(0, 10000)
              );

              void analyzeDocument(text);
              return JSON.stringify({
                success: true,
                message: `SAY: "analyzing now"`,
              });
            } catch (error) {
              console.error("Error fetching document:", error);
              console.log("User entered invalid URL:", urlText);
              return JSON.stringify({
                success: false,
                message:
                  "The URL provided appears to be invalid. Please provide a valid URL to a .txt file.",
              });
            }
          } catch (error) {
            console.error("Error opening document popup:", error);
            return JSON.stringify({
              success: false,
              message:
                "Something went wrong while processing your request. Please try again.",
            });
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

    const model = new openai.realtime.RealtimeModel({
      model: "gpt-4o-realtime-preview-2024-12-17",
      instructions: `You are an helpful assistant. You can do two different things. 
      You can tell the user the weather when they ask (use weather function) AND
      If the user want to discuss a document, he/she will add it via a separate form and the server will then analyze it. 

      After the server has analyzed it, you can use the search() function to request parts of the document.

      Please keep your intro short and concise.
      `,
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

    ctx.room.on(RoomEvent.DataReceived, async (payload, participant, kind) => {
      const data = JSON.parse(new TextDecoder().decode(payload));

      if (data.action === "analyzeUrl") {
        console.log("Analyzing URL:", data.payload.url);

        // Create a chat message in the conversation
        session.conversation.item.create(
          llm.ChatMessage.create({
            role: llm.ChatRole.USER,
            text: `call analyzeDocument(${data.payload.url})`,
          })
        );

        // Generate a response
        session.response.create();

        return;
      }

      console.log("Received message:", new TextDecoder().decode(payload));
      console.log("From participant:", participant?.identity);
      console.log("Message type:", kind); // reliable/unreliable
    });

    session.response.create();
  },
});

cli.runApp(
  new WorkerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: "doc-bot", // IMPORTANT: If you do set a name, the agent will not auto join any room! https://docs.livekit.io/agents/build/dispatch/
    workerType: JobType.JT_ROOM,
    numIdleProcesses: 2,
  })
);
