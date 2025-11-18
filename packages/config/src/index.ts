import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url().describe('Postgres connection string hosted on Render'),
  VECTOR_DB_URL: z.string().url().describe('PGVector connection string or API endpoint'),
  HUGGINGFACE_API_URL: z.string().url(),
  HUGGINGFACE_API_TOKEN: z.string().min(10),
  NETLIFY_SITE_ID: z.string().optional(),
  RENDER_SERVICE_URL: z.string().optional(),
  SCRAPY_PROJECT_ROOT: z.string().optional()
});

export type AppEnv = z.infer<typeof schema>;

export const env: AppEnv = schema.parse(process.env);
