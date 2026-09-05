// import OpenAI from "openai";
// import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
// import { PAYMIND_SYSTEM_PROMPT } from "./system-prompt";
// import { PAYMIND_TOOLS, callTool } from "./tools";
// import { buildCardAndContext } from "./cards";
// import { EMPTY_CONTEXT } from "./types";
// import type { AssistantContext, ChatMessage, AnswerCard } from "./types";

// const MODEL = process.env.PAYMIND_AI_MODEL || "gpt-4o-mini";
// const MAX_TOOL_ROUNDS = 4;

// export class MissingApiKeyError extends Error {
//   constructor() {
//     super("OPENAI_API_KEY is not configured.");
//     this.name = "MissingApiKeyError";
//   }
// }

// export class AssistantTimeoutError extends Error {
//   constructor() {
//     super("The assistant took too long to respond.");
//     this.name = "AssistantTimeoutError";
//   }
// }

// let client: OpenAI | null = null;
// function getClient(): OpenAI {
//   const apiKey = process.env.OPENAI_API_KEY;
//   if (!apiKey) throw new MissingApiKeyError();
//   if (!client) client = new OpenAI({ apiKey });
//   return client;
// }

// function contextToPrompt(context: AssistantContext): string | null {
//   const parts: string[] = [];
//   if (context.lastAudience) {
//     parts.push(
//       `The last audience discussed was "${context.lastAudience.label}" (${context.lastAudience.count} customers).`
//     );
//   }
//   if (context.lastCustomerId && context.lastCustomerName) {
//     parts.push(
//       `The last specific customer discussed was ${context.lastCustomerName} (id: ${context.lastCustomerId}).`
//     );
//   }
//   if (context.lastProduct) {
//     parts.push(`The last product discussed was "${context.lastProduct}".`);
//   }
//   if (parts.length === 0) return null;
//   return `Conversation context from earlier in this session (use only to resolve clear pronoun references like "them" or "this customer" — re-verify any facts with a tool call, don't restate old numbers from memory):\n${parts.join(
//     "\n"
//   )}`;
// }

// export interface AssistantResult {
//   reply: string;
//   context: AssistantContext;
//   card: AnswerCard | null;
//   toolsUsed: string[];
// }

// /**
//  * Runs one turn of the Ask PayMind conversation: sends the message
//  * history + system prompt + context to OpenAI with the PayMind tool
//  * set, executes any tool calls the model makes (and only those —
//  * see lib/ai/tools/dispatch.ts), feeds results back, and repeats
//  * until the model produces a final answer or MAX_TOOL_ROUNDS is hit.
//  */
// export async function runAssistantTurn(
//   history: ChatMessage[],
//   context: AssistantContext = EMPTY_CONTEXT
// ): Promise<AssistantResult> {
//   const openai = getClient();

//   const messages: ChatCompletionMessageParam[] = [
//     { role: "system", content: PAYMIND_SYSTEM_PROMPT },
//   ];
//   const contextPrompt = contextToPrompt(context);
//   if (contextPrompt) {
//     messages.push({ role: "system", content: contextPrompt });
//   }
//   for (const m of history) {
//     messages.push({ role: m.role, content: m.content });
//   }

//   const toolsUsed: string[] = [];
//   let lastCard: AnswerCard | null = null;
//   let contextPatch: Partial<AssistantContext> = {};

//   for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
//     const response = await withTimeout(
//       openai.chat.completions.create({
//         model: MODEL,
//         messages,
//         tools: PAYMIND_TOOLS,
//         tool_choice: "auto",
//         temperature: 0.3,
//       }),
//       20_000
//     );

//     const choice = response.choices[0];
//     const message = choice.message;

//     if (!message.tool_calls || message.tool_calls.length === 0) {
//       return {
//         reply: message.content?.trim() || "I wasn't able to generate a response — please try rephrasing your question.",
//         context: { ...context, ...contextPatch },
//         card: lastCard,
//         toolsUsed,
//       };
//     }

//     messages.push(message);

//     for (const toolCall of message.tool_calls) {
//       if (toolCall.type !== "function") continue;
//       const { toolName, args, result } = await callTool(
//         toolCall.function.name,
//         toolCall.function.arguments
//       ).then((r) => ({ toolName: r.toolName, args: r.args, result: r.result }));

//       toolsUsed.push(toolName);

//       const { card, contextPatch: patch } = buildCardAndContext(toolName, args, result);
//       if (card) lastCard = card;
//       contextPatch = { ...contextPatch, ...patch };

//       messages.push({
//         role: "tool",
//         tool_call_id: toolCall.id,
//         content: JSON.stringify(result),
//       });
//     }
//   }

//   return {
//     reply:
//       "I gathered some data but couldn't finish putting together a full answer — could you narrow down your question a bit?",
//     context: { ...context, ...contextPatch },
//     card: lastCard,
//     toolsUsed,
//   };
// }

// function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
//   return new Promise((resolve, reject) => {
//     const timer = setTimeout(() => reject(new AssistantTimeoutError()), ms);
//     promise.then(
//       (v) => {
//         clearTimeout(timer);
//         resolve(v);
//       },
//       (e) => {
//         clearTimeout(timer);
//         reject(e);
//       }
//     );
//   });
// }







// 



import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { PAYMIND_SYSTEM_PROMPT } from "./system-prompt";
import { PAYMIND_TOOLS, callTool } from "./tools";
import { buildCardAndContext } from "./cards";
import { EMPTY_CONTEXT } from "./types";
import type { AssistantContext, ChatMessage, AnswerCard } from "./types";

// Gemini model
const MODEL = process.env.PAYMIND_AI_MODEL || "gemini-2.5-flash";

const MAX_TOOL_ROUNDS = 4;

export class MissingApiKeyError extends Error {
  constructor() {
    super("GEMINI_API_KEY is not configured.");
    this.name = "MissingApiKeyError";
  }
}

export class AssistantTimeoutError extends Error {
  constructor() {
    super("The assistant took too long to respond.");
    this.name = "AssistantTimeoutError";
  }
}

// Gemini provides an OpenAI-compatible API.
// We use the OpenAI npm package as the client,
// but requests are sent to Google's Gemini API.
let client: OpenAI | null = null;

function getClient(): OpenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new MissingApiKeyError();
  }

  if (!client) {
    client = new OpenAI({
      apiKey,
      baseURL:
        "https://generativelanguage.googleapis.com/v1beta/openai/",
    });
  }

  return client;
}

function contextToPrompt(context: AssistantContext): string | null {
  const parts: string[] = [];

  if (context.lastAudience) {
    parts.push(
      `The last audience discussed was "${context.lastAudience.label}" (${context.lastAudience.count} customers).`
    );
  }

  if (context.lastCustomerId && context.lastCustomerName) {
    parts.push(
      `The last specific customer discussed was ${context.lastCustomerName} (id: ${context.lastCustomerId}).`
    );
  }

  if (context.lastProduct) {
    parts.push(`The last product discussed was "${context.lastProduct}".`);
  }

  if (parts.length === 0) {
    return null;
  }

  return `Conversation context from earlier in this session (use only to resolve clear pronoun references like "them" or "this customer" — re-verify any facts with a tool call, don't restate old numbers from memory):
${parts.join("\n")}`;
}

export interface AssistantResult {
  reply: string;
  context: AssistantContext;
  card: AnswerCard | null;
  toolsUsed: string[];
}

/**
 * Runs one turn of the Ask PayMind conversation:
 *
 * - Sends the message history + system prompt + context to Gemini
 * - Uses Gemini's OpenAI-compatible API
 * - Allows Gemini to call PayMind tools
 * - Executes the requested tools
 * - Feeds results back to Gemini
 * - Repeats until Gemini produces a final answer
 */
export async function runAssistantTurn(
  history: ChatMessage[],
  context: AssistantContext = EMPTY_CONTEXT
): Promise<AssistantResult> {
  const gemini = getClient();

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: PAYMIND_SYSTEM_PROMPT,
    },
  ];

  const contextPrompt = contextToPrompt(context);

  if (contextPrompt) {
    messages.push({
      role: "system",
      content: contextPrompt,
    });
  }

  for (const m of history) {
    messages.push({
      role: m.role,
      content: m.content,
    });
  }

  const toolsUsed: string[] = [];

  let lastCard: AnswerCard | null = null;

  let contextPatch: Partial<AssistantContext> = {};

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await withTimeout(
      gemini.chat.completions.create({
        model: MODEL,
        messages,
        tools: PAYMIND_TOOLS,
        temperature: 0.3,
      }),
      20_000
    );

    const choice = response.choices[0];

    if (!choice) {
      return {
        reply:
          "I wasn't able to generate a response — please try rephrasing your question.",
        context: {
          ...context,
          ...contextPatch,
        },
        card: lastCard,
        toolsUsed,
      };
    }

    const message = choice.message;

    // Gemini has produced the final natural-language answer.
    if (!message.tool_calls || message.tool_calls.length === 0) {
      return {
        reply:
          message.content?.trim() ||
          "I wasn't able to generate a response — please try rephrasing your question.",
        context: {
          ...context,
          ...contextPatch,
        },
        card: lastCard,
        toolsUsed,
      };
    }

    // Add Gemini's tool-call message to the conversation.
    messages.push(message);

    // Execute every tool requested by Gemini.
    for (const toolCall of message.tool_calls) {
      if (toolCall.type !== "function") {
        continue;
      }

      const { toolName, args, result } = await callTool(
        toolCall.function.name,
        toolCall.function.arguments
      ).then((r) => ({
        toolName: r.toolName,
        args: r.args,
        result: r.result,
      }));

      toolsUsed.push(toolName);

      // Build PayMind UI cards/context from the tool result.
      const {
        card,
        contextPatch: patch,
      } = buildCardAndContext(toolName, args, result);

      if (card) {
        lastCard = card;
      }

      contextPatch = {
        ...contextPatch,
        ...patch,
      };

      // Give the tool result back to Gemini.
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }
  }

  return {
    reply:
      "I gathered some data but couldn't finish putting together a full answer — could you narrow down your question a bit?",
    context: {
      ...context,
      ...contextPatch,
    },
    card: lastCard,
    toolsUsed,
  };
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new AssistantTimeoutError());
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}