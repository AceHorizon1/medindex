import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { personalStatementFeedback } from '@medindex/ai';

const schema = z.object({
  statement: z.string().min(100)
});

export async function registerStatementRoutes(app: FastifyInstance) {
  app.post('/feedback', async (request, reply) => {
    const payload = schema.parse(request.body);
    const feedback = await personalStatementFeedback(payload.statement);
    reply.send(feedback);
  });
}
