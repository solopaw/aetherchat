'use server';

import { chatWithTools } from '@/ai/flows/tool-use';

export async function sendMessage(message: string): Promise<{ response?: string; error?: string }> {
  if (!message) {
    return { error: 'Message cannot be empty.' };
  }

  try {
    const { response } = await chatWithTools({ message });
    return { response };
  } catch (error) {
    console.error('Error calling AI tool:', error);
    return { error: 'Sorry, I encountered an error. Please try again.' };
  }
}
