// ===============================
// TOOL CALLING WITH GROQ + TAVILY
// ===============================

import Groq from "groq-sdk";
import { tavily } from "@tavily/core";
import "./config.js"; // for env
import NodeCache from "node-cache";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
// console.log("GROQ KEY:", process.env.GROQ_API_KEY);

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

//*Adding node cache -> for temp storing data (Memory)
/* stdTTL -> to set expiry time, after a certain period data will be auto  cleared 
expiry time in seconds0
*/
const myCache = new NodeCache({stdTTL:60*60*24}) // Expires after 24 hrs




// -------------------------------
// Web Search Tool Function
// -------------------------------
async function webSearch({ query }) {
  console.log(" Calling webSearch tool...");

  const response = await tvly.search(query);

  const finalResult = response.results.map((r) => r.content).join("\n\n");

  return finalResult;
}

// -------------------------------
// MAIN FUNCTION
// -------------------------------
export async function chatBot(userMessage, conversationId) {
  const baseMessages = [
    {
      role: "system",
      content: `You are a smart personal assistant.

If you know the answer to a question, answer it directly in plain English.

If the answer requires real-time, local, or up-to-date information, or if you don’t know the answer, use the available tools to find it.

You have access to the following tool:

webSearch(query: string): Use this to search the internet for current or unknown information.

Decide when to use your own knowledge and when to use the tool.

Do not mention the tool unless needed.


Examples:

Q: What is the capital of France?
A: The capital of France is Paris.

Q: What’s the weather in Mumbai right now?
A: (use the search tool to find the latest weather)

Q: Who is the Prime Minister of India?
A: The current Prime Minister of India is Narendra Modi.

Q: Tell rne the latest IT news.
A: (use the search tool to get the latest news)

current date and tirne: ${new Date().toUTCString()}
`,
    },
    /* {
      role: "user",
      content: "current weather in mumbai",
    }, */
  ];

  //*Retrieve a key (GET):
  //myCache.get( key )
  const messages = myCache.get(conversationId) ?? baseMessages


   
  messages.push({
    role: "user",
    content: userMessage,
  });
  let MAX_RETRIES =  10
  let count = 0

  // inside while loop is for LLM
  while (true) {
    // -------------------------------
    // STEP 1 — First Model Call
    // -------------------------------
   
    // *prevent from infinit tool calling 
    if(count > MAX_RETRIES ){
      return "I could not find the result , pls try again "
    }
    count ++
    
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      messages,
      tools: [
        {
          type: "function",
          function: {
            name: "webSearch",
            description:
              "Search the latest information and realtime data on the internet",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search query",
                },
              },
              required: ["query"],
            },
          },
        },
      ],

      tool_choice: "auto",
    });

    const assistantMessage = completion.choices[0].message;

    // 🔥 IMPORTANT — push assistant message, if not later model will forget
    messages.push(assistantMessage);
    // console.log("assistantMsg",assistantMessage)

    const toolCalls = assistantMessage.tool_calls;
    // console.log("tool call",toolCalls)

    // -------------------------------
    // STEP 2 — If No Tool Call
    // -------------------------------
    if (!toolCalls) {
      //Store a key (SET):
      //here we end chatbot response
      myCache.set(conversationId,messages)
      // console.log(myCache)
      return assistantMessage.content;

    }

    // -------------------------------
    // STEP 3 — Execute Tool
    // -------------------------------
    for (const tool of toolCalls) {
      const functionName = tool.function.name;
      const functionArgs = JSON.parse(tool.function.arguments);

      if (functionName === "webSearch") {
        const toolResult = await webSearch(functionArgs);
        //   console.log("tool result:",toolResult)

        messages.push({
          role: "tool",
          tool_call_id: tool.id,
          name: functionName,
          content: String(toolResult),
        });
      }
    }
  }
}
