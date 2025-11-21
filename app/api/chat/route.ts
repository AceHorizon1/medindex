import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json();

    // Use Hugging Face Inference API
    const apiKey = process.env.HUGGINGFACE_API_TOKEN;
    const model = process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen2.5-7B-Instruct';

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'HUGGINGFACE_API_TOKEN not configured. Please add it to your environment variables.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Format messages for Hugging Face chat format
    const formattedMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    // Use Hugging Face Inference Providers (OpenAI-compatible API)
    // This provides better streaming support and automatic provider selection
    const apiUrl = 'https://router.huggingface.co/v1/chat/completions';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        max_tokens: 512,
        temperature: 0.7,
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', response.status, errorText);
      
      // Fallback to direct Inference API if router fails
      return await callDirectInferenceAPI(apiKey, model, formattedMessages);
    }

    // Stream the response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) {
              // Send final [DONE] message before closing
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
              controller.close();
              return;
            }

            // Decode and add to buffer
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            
            // Keep the last incomplete line in buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') {
                  controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                  controller.close();
                  return;
                }

                if (data) {
                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      controller.enqueue(
                        new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
                      );
                    }
                  } catch (e) {
                    // Skip invalid JSON - might be empty lines or other data
                    console.debug('Skipping invalid JSON:', data);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          // Send error message and close gracefully
          try {
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`)
            );
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          } catch (e) {
            // Ignore errors when closing
          }
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
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Fallback function for direct Inference API
async function callDirectInferenceAPI(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>
) {
  try {
    // Convert messages to prompt format for direct Inference API
    const prompt = messages
      .map((msg) => {
        if (msg.role === 'system') {
          return `System: ${msg.content}\n\n`;
        } else if (msg.role === 'user') {
          return `User: ${msg.content}\n\n`;
        } else {
          return `Assistant: ${msg.content}\n\n`;
        }
      })
      .join('') + 'Assistant:';

    const apiUrl = `https://api-inference.huggingface.co/models/${model}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        inputs: prompt,
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

    // Simulate streaming by chunking the response
    return new Response(
      new ReadableStream({
        start(controller) {
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
  } catch (error) {
    console.error('Direct Inference API error:', error);
    throw error;
  }
}
