# MedIndex Stack Decisions

- **Hosting**: Netlify (Next.js app) + Render (Fastify API + Postgres + PGVector). Netlify deploy hooks trigger Render redeploys via `render.yaml`.
- **Packages**: PNPM/Turborepo mono-repo with shared UI/config/data/ai packages.
- **Data**: Prisma schema over Render Postgres, ingestion pipeline shells out to official [Scrapy](https://github.com/scrapy/scrapy) spiders.
- **AI**: Hugging Face free inference endpoint (e.g., `mistralai/Mistral-7B-Instruct-v0.2`) via `@huggingface/inference`. RAG uses PGVector metadata filters from `packages/ai`.
- **Toolchain**: TypeScript everywhere, Tailwind for styling, Vitest/Playwright for testing.
