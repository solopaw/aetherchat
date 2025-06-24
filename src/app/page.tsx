'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendMessage } from '@/app/actions';
import { BotAvatar } from '@/components/bot-avatar';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await sendMessage(input);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        setMessages((prev) => prev.slice(0, -1)); // Revert optimistic update
      } else if (result.response) {
        const assistantMessage: Message = { role: 'assistant', content: result.response };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred.',
      });
      setMessages((prev) => prev.slice(0, -1)); // Revert optimistic update
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b shrink-0 bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <BotAvatar className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-semibold font-headline">AetherChat</h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl p-4 mx-auto space-y-8 sm:p-6">
          {messages.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground p-8 rounded-lg bg-card/50">
                <BotAvatar className="w-16 h-16 mx-auto mb-4 text-primary/70" />
                <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome to AetherChat</h2>
                <p>Start a conversation by typing a message below.</p>
                <p className="text-sm mt-4">You can ask things like "What is 2+2?" or "What is the capital of France?".</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-4 animate-in fade-in duration-500',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="w-10 h-10 border bg-card">
                  <AvatarFallback className="bg-transparent">
                    <BotAvatar className="w-6 h-6 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[75%] p-3 rounded-xl shadow-xs',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-card-foreground'
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <Avatar className="w-10 h-10 border bg-card">
                  <AvatarFallback className="bg-transparent">
                    <User className="w-5 h-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-4 justify-start animate-in fade-in duration-500">
              <Avatar className="w-10 h-10 border bg-card">
                <AvatarFallback className="bg-transparent">
                  <BotAvatar className="w-6 h-6 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="max-w-[75%] p-3 rounded-xl bg-card text-card-foreground flex items-center space-x-2 shadow-xs">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Aether is thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-4 border-t bg-card/80 backdrop-blur-xs">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message AetherChat..."
              className="pr-16 resize-none min-h-[48px]"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}
