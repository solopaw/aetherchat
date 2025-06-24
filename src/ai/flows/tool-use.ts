'use server';

/**
 * @fileOverview Implements a Genkit flow that allows the chatbot to use tools to provide more accurate responses.
 *
 * - chatWithTools - A function that handles the conversation with the chatbot using tools.
 * - ChatWithToolsInput - The input type for the chatWithTools function.
 * - ChatWithToolsOutput - The return type for the chatWithTools function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatWithToolsInputSchema = z.object({
  message: z.string().describe('The user message to process.'),
});
export type ChatWithToolsInput = z.infer<typeof ChatWithToolsInputSchema>;

const ChatWithToolsOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user message.'),
});
export type ChatWithToolsOutput = z.infer<typeof ChatWithToolsOutputSchema>;

export async function chatWithTools(input: ChatWithToolsInput): Promise<ChatWithToolsOutput> {
  return chatWithToolsFlow(input);
}

const calculatorTool = ai.defineTool({
  name: 'calculator',
  description: 'A calculator that can perform basic arithmetic operations.',
  inputSchema: z.object({
    expression: z.string().describe('The mathematical expression to evaluate.'),
  }),
  outputSchema: z.number().describe('The result of the calculation.'),
},
async (input) => {
  try {
    // eslint-disable-next-line no-eval
    return eval(input.expression) as number;
  } catch (e) {
    return NaN;
  }
});


const knowledgeBaseTool = ai.defineTool({
  name: 'knowledgeBase',
  description: 'A knowledge base that can answer questions about general knowledge topics.',
  inputSchema: z.object({
    query: z.string().describe('The question to ask the knowledge base.'),
  }),
  outputSchema: z.string().describe('The answer from the knowledge base.'),
},
async (input) => {
  // Replace this with a real knowledge base lookup.
  if (input.query.toLowerCase().includes('capital of france')) {
    return 'The capital of France is Paris.';
  }
  if (input.query.toLowerCase().includes('square root of 9')) {
    return 'The square root of 9 is 3.';
  }

  return 'I am sorry, I do not have the answer to that question.';
});

const chatWithToolsPrompt = ai.definePrompt({
  name: 'chatWithToolsPrompt',
  tools: [calculatorTool, knowledgeBaseTool],
  input: {schema: ChatWithToolsInputSchema},
  output: {schema: ChatWithToolsOutputSchema},
  prompt: `You are a helpful chatbot that can use tools to provide more accurate or comprehensive responses.

  The following tools are available to you:
  - calculator: A calculator that can perform basic arithmetic operations.
  - knowledgeBase: A knowledge base that can answer questions about general knowledge topics.

  User message: {{{message}}}

  If a user asks a question that can be answered by one of these tools, use the tool to answer the question.
  Think step by step, and respond directly to the user.
  `,
});

const chatWithToolsFlow = ai.defineFlow({
  name: 'chatWithToolsFlow',
  inputSchema: ChatWithToolsInputSchema,
  outputSchema: ChatWithToolsOutputSchema,
}, async (input) => {
  const {output} = await chatWithToolsPrompt(input);
  return output!;
});
