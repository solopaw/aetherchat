// src/ai/flows/chat-from-prompt.ts
'use server';

/**
 * @fileOverview A chat AI agent that starts a conversation based on a prompt.
 *
 * - chatFromPrompt - A function that starts a conversation based on a prompt.
 * - ChatFromPromptInput - The input type for the chatFromPrompt function.
 * - ChatFromPromptOutput - The return type for the chatFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatFromPromptInputSchema = z.object({
  prompt: z.string().describe('The prompt to start the conversation with.'),
});
export type ChatFromPromptInput = z.infer<typeof ChatFromPromptInputSchema>;

const ChatFromPromptOutputSchema = z.object({
  response: z.string().describe('The response from the chatbot.'),
});
export type ChatFromPromptOutput = z.infer<typeof ChatFromPromptOutputSchema>;

export async function chatFromPrompt(input: ChatFromPromptInput): Promise<ChatFromPromptOutput> {
  return chatFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatFromPromptPrompt',
  input: {schema: ChatFromPromptInputSchema},
  output: {schema: ChatFromPromptOutputSchema},
  prompt: `{{prompt}}`,
});

const chatFromPromptFlow = ai.defineFlow(
  {
    name: 'chatFromPromptFlow',
    inputSchema: ChatFromPromptInputSchema,
    outputSchema: ChatFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
