import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { env } from '@medindex/config';
import { registerSchoolRoutes } from './routes/schools.js';
import { registerComparisonRoutes } from './routes/comparison.js';
import { registerMatchRoutes } from './routes/match.js';
import { registerAiRoutes } from './routes/ai.js';
import { registerStatementRoutes } from './routes/statements.js';

const app = Fastify({
  logger: true
});

await app.register(cors, {
  origin: [process.env.MEDINDEX_WEB_ORIGIN ?? '*']
});

await app.register(rateLimit, {
  max: 60,
  timeWindow: '1 minute'
});

app.get('/healthz', async () => ({ status: 'ok' }));

await app.register(registerSchoolRoutes, { prefix: '/schools' });
await app.register(registerComparisonRoutes, { prefix: '/comparison' });
await app.register(registerMatchRoutes, { prefix: '/match' });
await app.register(registerAiRoutes, { prefix: '/ai' });
await app.register(registerStatementRoutes, { prefix: '/statements' });

const port = Number(process.env.PORT ?? 4000);
app
  .listen({ port, host: '0.0.0.0' })
  .then(() => console.log(`API running on ${port}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
