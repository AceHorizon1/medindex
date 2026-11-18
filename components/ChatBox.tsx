/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef, useEffect, DragEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Send,
  Paperclip,
  FileText,
  Image as ImageIcon,
  X,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export interface AttachedFile {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  attachments?: AttachedFile[];
}

interface ChatBoxProps {
  systemPrompt?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export function ChatBox({ systemPrompt }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm your medical school admissions advisor. I can help you with school selection, application strategies, MCAT prep, and evaluating your profile.\n\nYou can ask any questions, or upload a transcript (PDF), MCAT score report, or resume (PNG/PDF) for a personalized evaluation.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const processFile = (file: File) => {
    setFileError(null);

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(file.name);

    if (!isPdf && !isImage) {
      setFileError(`Unsupported format: ${file.name}. Please upload PDF, PNG, JPG, or WEBP.`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File too large: ${file.name} exceeds the 10MB limit.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPendingFiles((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type || (isPdf ? 'application/pdf' : 'image/png'),
            size: file.size,
            dataUrl: reader.result as string,
          },
        ]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(processFile);
      e.target.value = ''; // Reset input so same file can be re-selected if removed
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(processFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && pendingFiles.length === 0) || loading) return;

    const currentFiles = [...pendingFiles];
    const userMessage: Message = {
      role: 'user',
      content: text || (currentFiles.length > 0 ? 'Please review the attached document(s).' : ''),
      attachments: currentFiles.length > 0 ? currentFiles : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setPendingFiles([]);
    setFileError(null);
    setLoading(true);

    // Placeholder assistant message
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          attachments: currentFiles.map((f) => ({
            name: f.name,
            type: f.type,
            data: f.dataUrl,
          })),
          systemPrompt,
        }),
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
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') break;

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
                        const last = newMessages[newMessages.length - 1];
                        if (last?.role === 'assistant') {
                          newMessages[newMessages.length - 1] = {
                            role: 'assistant',
                            content: assistantMessage,
                          };
                        } else {
                          newMessages.push({ role: 'assistant', content: assistantMessage });
                        }
                        return newMessages;
                      });
                    }
                  } catch (e) {
                    if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
                      console.debug('Skipping line:', data);
                    }
                  }
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }

      if (assistantMessage) {
        setMessages((prev) => {
          const newMessages = [...prev];
          const last = newMessages[newMessages.length - 1];
          if (last?.role === 'assistant') {
            newMessages[newMessages.length - 1] = {
              role: 'assistant',
              content: assistantMessage,
            };
          }
          return newMessages;
        });
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages((prev) => {
        const newMessages = prev.slice(0, -1);
        newMessages.push({
          role: 'assistant',
          content:
            error instanceof Error
              ? `Error: ${error.message}`
              : 'Sorry, I encountered an error. Please try again.',
        });
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className={`flex flex-col h-[600px] sm:h-[680px] transition-colors ${
        isDragging ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold">AI Advisor Chat</CardTitle>
            <p className="text-xs text-muted-foreground">
              Powered by fine-tuned admissions guidelines &amp; local document analysis
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>In-Memory Only</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-3 pr-1">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Attachments preview on message */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-1.5 max-w-[85%] sm:max-w-[80%]">
                  {msg.attachments.map((file, fileIdx) => (
                    <div
                      key={fileIdx}
                      className="flex items-center gap-1.5 bg-muted/80 text-foreground text-xs px-2.5 py-1.5 rounded-md border"
                    >
                      {file.type === 'application/pdf' ? (
                        <FileText className="h-4 w-4 text-rose-500" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-blue-500" />
                      )}
                      <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Message text bubble */}
              {msg.content && (
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 text-sm sm:text-base whitespace-pre-wrap leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted/70 text-foreground border rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground rounded-2xl px-4 py-2.5 text-sm sm:text-base flex items-center gap-2 border">
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-ping" />
                <span className="animate-pulse">Advisor is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Drag and Drop Overlay Notice */}
        {isDragging && (
          <div className="p-3 mb-2 bg-primary/10 border-2 border-dashed border-primary rounded-lg text-center text-sm font-medium text-primary">
            Drop your PDF or image here to attach
          </div>
        )}

        {/* File Error Notice */}
        {fileError && (
          <div className="flex items-center justify-between text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-md p-2 mb-2">
            <span>{fileError}</span>
            <button onClick={() => setFileError(null)} className="hover:opacity-75">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Pending Attachments Bar */}
        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 mb-2 bg-muted/40 rounded-lg border">
            {pendingFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 bg-background text-xs px-2.5 py-1.5 rounded-md border shadow-xs"
              >
                {file.type === 'application/pdf' ? (
                  <FileText className="h-4 w-4 text-rose-500 shrink-0" />
                ) : (
                  <div className="relative shrink-0">
                    <img
                      src={file.dataUrl}
                      alt={file.name}
                      className="h-5 w-5 rounded object-cover"
                    />
                  </div>
                )}
                <span className="truncate max-w-[130px] font-medium">{file.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  ({formatFileSize(file.size)})
                </span>
                <button
                  type="button"
                  onClick={() => removePendingFile(idx)}
                  className="text-muted-foreground hover:text-foreground ml-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/png,image/jpeg,image/webp,image/jpg"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />

          {/* Paperclip Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="shrink-0 relative hover:bg-muted"
            title="Attach PDF transcript or image (PNG, JPG)"
          >
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            {pendingFiles.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingFiles.length}
              </span>
            )}
          </Button>

          {/* Text Input */}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={
              pendingFiles.length > 0
                ? 'Add instructions or click send to evaluate document...'
                : 'Ask a question, or attach a transcript/MCAT report (PDF, PNG)...'
            }
            disabled={loading}
            className="text-sm sm:text-base"
          />

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={loading || (!input.trim() && pendingFiles.length === 0)}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Privacy & Transparency Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Local &amp; Ephemeral:</strong> Uploaded documents and transcripts are
              processed purely in-memory and are never stored in any database or cloud bucket.
            </span>
          </div>
          <span className="hidden sm:inline text-[10px] text-muted-foreground/80">
            Accepts PDF, PNG, JPG (up to 10MB)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
