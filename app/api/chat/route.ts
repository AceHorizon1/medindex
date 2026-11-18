import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { extractTextFromPdf } from '@/lib/pdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Free Chinese models for text
const CHINESE_FREE_TEXT_MODELS = [
  'baidu/ernie-5.5-flash-preview:free',
  'inclusionai/ling-3.2-flash:free',
];

// Free vision models for image analysis
const FREE_VISION_MODELS = [
  'nvidia/nemotron-3.5-super-vl:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
];

interface Attachment {
  name: string;
  type: string;
  data: string; // Base64 data or data URL
}

type MessageContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string } }
    >;

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: MessageContent;
}

function getAdvisorInstructions(): string {
  try {
    const configPath = path.join(process.cwd(), 'config', 'advisor-instructions.md');
    if (fs.existsSync(configPath)) {
      return fs.readFileSync(configPath, 'utf-8');
    }
  } catch (e) {
    console.warn('Could not read config/advisor-instructions.md:', e);
  }
  return `You are an experienced medical school admissions advisor with deep knowledge of MD and DO programs, application processes, MCAT preparation, and pre-medical education. Provide helpful, accurate, and encouraging guidance. Be concise but thorough, and always prioritize the student's best interests.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [], attachments = [], systemPrompt } = body;

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const hfKey = process.env.HUGGINGFACE_API_TOKEN;

    if (!openrouterKey && !hfKey) {
      return new Response(
        JSON.stringify({
          error:
            'AI API key not configured. Please set OPENROUTER_API_KEY in your environment variables.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Process in-memory attachments for the current message
    let pdfExtractedText = '';
    const imageAttachments: string[] = [];

    for (const file of attachments as Attachment[]) {
      if (!file.data) continue;

      if (file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf')) {
        try {
          // Extract base64 payload from data URL if needed
          const base64Data = file.data.includes(',')
            ? file.data.split(',')[1]
            : file.data;
          const pdfBuffer = Buffer.from(base64Data, 'base64');
          const parsedText = await extractTextFromPdf(pdfBuffer);

          if (parsedText) {
            pdfExtractedText += `\n\n--- [Attached Document: ${file.name} (Parsed In-Memory)] ---\n${parsedText}\n--- [End of ${file.name}] ---`;
          } else {
            pdfExtractedText += `\n\n[Notice: ${file.name} appears to be a scanned image or empty PDF. No selectable text was extracted.]`;
          }
        } catch (pdfErr) {
          console.error(`Failed to parse PDF ${file.name}:`, pdfErr);
          pdfExtractedText += `\n\n[Error reading ${file.name} in-memory]`;
        }
      } else if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(file.name)) {
        // Ensure data has the correct data URL format
        const dataUrl = file.data.startsWith('data:')
          ? file.data
          : `data:${file.type || 'image/png'};base64,${file.data}`;
        imageAttachments.push(dataUrl);
      }
    }

    // Format messages for LLM
    const formattedMessages: Message[] = [];

    // 1. Add System Instructions (from config/advisor-instructions.md)
    const baseInstructions = getAdvisorInstructions();
    const fullSystemPrompt = systemPrompt
      ? `${baseInstructions}\n\n### Session Specific Context\n${systemPrompt}`
      : baseInstructions;

    formattedMessages.push({ role: 'system', content: fullSystemPrompt });

    // 2. Add conversation history
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const isLastUserMessage = i === messages.length - 1 && msg.role === 'user';

      if (isLastUserMessage) {
        let textContent = typeof msg.content === 'string' ? msg.content : '';
        if (pdfExtractedText) {
          textContent = `${textContent}${pdfExtractedText}`.trim();
        }

        if (imageAttachments.length > 0) {
          const parts: Array<
            | { type: 'text'; text: string }
            | { type: 'image_url'; image_url: { url: string } }
          > = [{ type: 'text', text: textContent || 'Please analyze this uploaded document.' }];

          for (const imgUrl of imageAttachments) {
            parts.push({ type: 'image_url', image_url: { url: imgUrl } });
          }

          formattedMessages.push({ role: 'user', content: parts });
        } else {
          formattedMessages.push({ role: 'user', content: textContent });
        }
      } else {
        formattedMessages.push({ role: msg.role, content: msg.content });
      }
    }

    // Detect if vision model is required
    const requiresVision = formattedMessages.some(
      (m) => Array.isArray(m.content) && m.content.some((c) => c.type === 'image_url')
    );

    if (openrouterKey) {
      return await callOpenRouterStreaming({
        apiKey: openrouterKey,
        messages: formattedMessages,
        isVision: requiresVision,
      });
    }

    return await callHuggingFace(hfKey!, formattedMessages);
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function callOpenRouterStreaming({
  apiKey,
  messages,
  isVision,
}: {
  apiKey: string;
  messages: Message[];
  isVision: boolean;
}) {
  let modelsToTry: string[];

  if (isVision) {
    modelsToTry = FREE_VISION_MODELS;
  } else {
    const configured = process.env.CHAT_MODEL || process.env.OPENROUTER_MODEL;
    modelsToTry = configured
      ? [configured, ...CHINESE_FREE_TEXT_MODELS.filter((m) => m !== configured)]
      : CHINESE_FREE_TEXT_MODELS;
  }

  for (const currentModel of modelsToTry) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://medindex.netlify.app',
          'X-Title': 'MedIndex Advisor',
        },
        body: JSON.stringify({
          model: currentModel,
          messages,
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`OpenRouter error with model ${currentModel}:`, response.status, errText);
        continue;
      }

      if (!response.body) {
        throw new Error('No response body from OpenRouter');
      }

      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                controller.close();
                return;
              }

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) continue;
                const data = trimmed.slice(6).trim();

                if (data === '[DONE]') {
                  controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(
                      new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
                    );
                  }
                } catch {
                  // Skip non-json or ping chunks
                }
              }
            }
          } catch (err) {
            console.error('Streaming error:', err);
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`)
            );
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } catch (err) {
      console.warn(`Attempt failed for ${currentModel}:`, err);
    }
  }

  throw new Error('All model attempts failed. Please try again.');
}

async function callHuggingFace(apiKey: string, messages: Message[]) {
  const prompt =
    messages
      .map((msg) => {
        const text =
          typeof msg.content === 'string'
            ? msg.content
            : msg.content.map((c) => ('text' in c ? c.text : '')).join(' ');
        return `${msg.role}: ${text}\n\n`;
      })
      .join('') + 'Assistant:';

  const response = await fetch(
    'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 512, temperature: 0.7 },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Hugging Face error: ${response.statusText}`);
  }

  const data = await response.json();
  const text = Array.isArray(data) ? data[0]?.generated_text : data.generated_text || '';

  return new Response(
    new ReadableStream({
      start(controller) {
        const words = text.split(' ');
        let i = 0;
        const interval = setInterval(() => {
          if (i < words.length) {
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ content: words[i] + ' ' })}\n\n`)
            );
            i++;
          } else {
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
            controller.close();
            clearInterval(interval);
          }
        }, 30);
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    }
  );
}
