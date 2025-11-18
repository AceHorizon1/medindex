import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { advisorChat, generateSchoolExplainer } from '@medindex/ai';

const explainerSchema = z.object({
  question: z.string(),
  schoolName: z.string().optional(),
  facts: z.array(z.string()).min(1)
});

const chatSchema = z.object({
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).min(1)
});

export async function registerAiRoutes(app: FastifyInstance) {
  app.post('/explainer', async (request, reply) => {
    const payload = explainerSchema.parse(request.body);
    const response = await generateSchoolExplainer(payload);
    reply.send(response);
  });

  app.post('/advisor', async (request, reply) => {
    const payload = chatSchema.parse(request.body);
    const message = await advisorChat(payload.history);
    reply.send({ message });
  });
}
