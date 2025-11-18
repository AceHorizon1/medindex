import { HfInference } from '@huggingface/inference';
import { z } from 'zod';
import { env } from '@medindex/config';

const hf = new HfInference(env.HUGGINGFACE_API_TOKEN);

export type RagContext = {
  question: string;
  schoolName?: string;
  facts: string[];
};

const responseSchema = z.object({
  summary: z.string(),
  citations: z.array(z.string()).default([])
});

export async function generateSchoolExplainer(context: RagContext) {
  const prompt = `You are MedIndex, an advising assistant. Using the provided facts, explain the school in 120 words.
Facts: ${context.facts.join('\n')}
Question: ${context.question}
Return JSON with summary and citations.`;
  const raw = await hf.textGeneration({
    model: env.HUGGINGFACE_API_URL,
    inputs: prompt,
    parameters: { max_new_tokens: 220, temperature: 0.3 }
  });
  return responseSchema.parse(JSON.parse(raw.generated_text));
}

export async function advisorChat(history: Array<{ role: 'user' | 'assistant'; content: string }>) {
  const prompt = history
    .map((turn) => `${turn.role === 'user' ? 'User' : 'Advisor'}: ${turn.content}`)
    .join('\n');
  const result = await hf.textGeneration({
    model: env.HUGGINGFACE_API_URL,
    inputs: `${prompt}\nAdvisor:`,
    parameters: { max_new_tokens: 256, temperature: 0.4 }
  });
  return result.generated_text.replace(prompt, '').trim();
}

export async function personalStatementFeedback(statement: string) {
  const prompt = `You score medical school personal statements on a 1-10 scale.
Statement: """
${statement}
"""
Return JSON {"score": number, "strengths": string[], "deltas": string[]}.
`;
  const raw = await hf.textGeneration({
    model: env.HUGGINGFACE_API_URL,
    inputs: prompt,
    parameters: { max_new_tokens: 200 }
  });
  return JSON.parse(raw.generated_text.match(/\{[\s\S]*\}/)?.[0] ?? '{}');
}
