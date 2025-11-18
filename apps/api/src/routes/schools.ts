import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getSchool, listSchools } from '@medindex/data';

const searchQuery = z.object({
  q: z.string().optional(),
  state: z.string().length(2).optional(),
  designation: z.enum(['MD', 'DO']).optional()
});

export async function registerSchoolRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const parsed = searchQuery.parse(request.query);
    const schools = await listSchools({
      state: parsed.state,
      designation: parsed.designation
    });
    reply.send({ items: schools });
  });

  app.get('/:id', async (request, reply) => {
    const schema = z.object({ id: z.string() });
    const { id } = schema.parse(request.params);
    const school = await getSchool(id);
    if (!school) {
      reply.code(404).send({ message: 'School not found' });
      return;
    }
    reply.send(school);
  });
}
