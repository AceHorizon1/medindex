'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBoxProps {
  systemPrompt?: string;
}

export function ChatBox({ systemPrompt }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm your medical school admissions advisor. I can help you with school selection, application strategies, MCAT prep, and more. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Add placeholder assistant message
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          systemPrompt:
            systemPrompt ||
            'You are an experienced medical school admissions advisor. Provide helpful, accurate, and encouraging guidance to pre-med students. Be concise but thorough.'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let buffer = '';

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              // Stream ended successfully
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            
            // Keep the last incomplete line in buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') {
                  // Stream completed successfully
                  break;
                }

                if (data) {
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.error) {
                      throw new Error(parsed.error);
                    }
                    if (parsed.content) {
                      assistantMessage += parsed.content;
                      setMessages((prev) => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        if (lastMessage?.role === 'assistant') {
                          newMessages[newMessages.length - 1] = {
                            role: 'assistant',
                            content: assistantMessage
                          };
                        } else {
                          newMessages.push({ role: 'assistant', content: assistantMessage });
                        }
                        return newMessages;
                      });
                    }
                  } catch (e) {
                    // Skip invalid JSON - might be empty lines
                    if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
                      console.debug('Skipping line:', data);
                    }
                  }
                }
              }
            }
          }
        } catch (streamError) {
          console.error('Stream reading error:', streamError);
          throw streamError;
        } finally {
          reader.releaseLock();
        }
      }

      // If we have content, make sure it's in the messages
      if (assistantMessage) {
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage?.role === 'assistant') {
            newMessages[newMessages.length - 1] = {
              role: 'assistant',
              content: assistantMessage
            };
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Remove the empty assistant message and add error message
      setMessages((prev) => {
        const newMessages = prev.slice(0, -1); // Remove last (empty) message
        newMessages.push({
          role: 'assistant',
          content: error instanceof Error ? `Error: ${error.message}` : 'Sorry, I encountered an error. Please try again.'
        });
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[500px] sm:h-[600px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg sm:text-xl">AI Advisor Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6">
        <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-4 pr-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.content && (
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {msg.content}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            disabled={loading}
            className="text-sm sm:text-base"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon" className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
