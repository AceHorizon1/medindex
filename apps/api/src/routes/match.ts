import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { matchSchools } from '@medindex/data';

const schema = z.object({
  gpa: z.number().min(0).max(4),
  mcat: z.number().min(450).max(528),
  state: z.string().length(2).optional(),
  interests: z.array(z.string()).default([])
});

export async function registerMatchRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const payload = schema.parse(request.body);
    const results = await matchSchools(payload);
    reply.send({ results });
  });
}
