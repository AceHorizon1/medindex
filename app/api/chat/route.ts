import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json();

    const apiKey = process.env.GROK_API_KEY || process.env.HUGGINGFACE_API_TOKEN;
    const apiUrl =
      process.env.GROK_API_URL ||
      process.env.HUGGINGFACE_API_URL ||
      'https://api-inference.huggingface.co/models/meta-llama/Llama-3-8b-chat-hf';

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Format messages for the API
    const formattedMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    // Use Grok API or Hugging Face
    if (process.env.GROK_API_KEY) {
      // Grok API format
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: formattedMessages,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          try {
            while (true) {
              const { done, value } = await reader!.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
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
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }
          } finally {
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive'
        }
      });
    } else {
      // Hugging Face format (simplified streaming)
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          inputs: formattedMessages.map((m: any) => `${m.role}: ${m.content}`).join('\n'),
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const text = Array.isArray(data) ? data[0]?.generated_text : data.generated_text || '';

      return new Response(
        new ReadableStream({
          start(controller) {
            // Simulate streaming by chunking the response
            const words = text.split(' ');
            let index = 0;

            const interval = setInterval(() => {
              if (index < words.length) {
                const chunk = words[index] + (index < words.length - 1 ? ' ' : '');
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
                );
                index++;
              } else {
                controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                controller.close();
                clearInterval(interval);
              }
            }, 50);
          }
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive'
          }
        }
      );
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

