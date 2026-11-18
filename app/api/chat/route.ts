import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Free Chinese models on OpenRouter
const CHINESE_FREE_MODELS = [
  'baidu/ernie-5.5-flash-preview:free',
  'inclusionai/ling-3.2-flash:free',
];

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json();

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const hfKey = process.env.HUGGINGFACE_API_TOKEN;
    const requestedModel =
      process.env.CHAT_MODEL ||
      process.env.OPENROUTER_MODEL ||
      'baidu/ernie-5.5-flash-preview:free';

    if (!openrouterKey && !hfKey) {
      return new Response(
        JSON.stringify({
          error:
            'AI API key not configured. Please set OPENROUTER_API_KEY in your environment variables.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const formattedMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    if (openrouterKey) {
      return await callOpenRouterStreaming(openrouterKey, requestedModel, formattedMessages);
    }

    return await callHuggingFace(hfKey!, requestedModel, formattedMessages);
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function callOpenRouterStreaming(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>
) {
  const modelsToTry = [model, ...CHINESE_FREE_MODELS.filter((m) => m !== model)];

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

async function callHuggingFace(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>
) {
  const prompt = messages
    .map((msg) => `${msg.role}: ${msg.content}\n\n`)
    .join('') + 'Assistant:';

  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 512, temperature: 0.7 },
    }),
  });

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
