import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@medindex/data';

const payloadSchema = z.object({ ids: z.array(z.string()).min(2).max(4) });

export async function registerComparisonRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const { ids } = payloadSchema.parse(request.body);
    const schools = await prisma.medicalSchool.findMany({ where: { id: { in: ids } } });
    reply.send({
      schools,
      narrative: schools
        .map((school) => `${school.name} average MCAT ${school.avgMcat ?? 'n/a'}`)
        .join('\n')
    });
  });
}
