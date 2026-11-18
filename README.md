# MedIndex

A modern, full-stack Next.js 14 application for pre-med students to search, compare, and get AI-guided insights on U.S. MD/DO medical schools. Powered by **Turso (LibSQL)** at the edge and kept fresh with automated **GitHub Actions** web scraping.

---

## Features

- **Comprehensive School Database**: Search and filter medical schools by GPA, MCAT, tuition, type (MD/DO), and required courses.
- **Always Active Database**: Powered by Turso (distributed SQLite at the edge) — never pauses or deletes after periods of inactivity.
- **Automated Web Scraping & Data Refresh**: Periodic GitHub Actions pipeline that automatically crawls official admissions pages and updates the database.
- **School Profiles**: Detailed pages with prerequisites, admissions statistics, tuition, mission statements, deadlines, and official links.
- **Side-by-Side Comparison**: Compare multiple schools side-by-side with detailed metrics.
- **AI-Powered Advisor**: Interactive pre-med admissions counseling powered by high-performance models (Baidu ERNIE / OpenRouter) with customizable instructions and vision models.
- **Transcript & Score Report Review**: Upload PDF transcripts, resumes, and PNG/JPG score report screenshots directly in chat.
- **100% Ephemeral & Private**: Transcripts and images are analyzed purely in-memory (RAM) and are never saved to any database, disk, or external cloud bucket.
- **Customizable Advisor Instructions**: Fine-tune the AI advisor's grading rules, recommendations, and evaluation criteria simply by editing `config/advisor-instructions.md`.
- **Responsive & Dark Mode**: Mobile-friendly, polished UI built with TailwindCSS and shadcn components.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: [Turso](https://turso.tech) (LibSQL / SQLite at the Edge)
- **Data Automation & Scraping**: GitHub Actions, Playwright, Patchright, and OpenRouter LLM extraction
- **Styling**: TailwindCSS + shadcn/ui + Radix UI
- **AI Advisor**: OpenRouter (`baidu/ernie-5.5-flash-preview:free`, `nvidia/nemotron-3.5-super-vl:free` for vision)
- **In-Memory Document Parsing**: `pdf-parse` (RAM-only extraction)
- **Deployment**: Netlify / Vercel

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/AceHorizon1/medindex.git
cd medindex
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Turso Database
TURSO_DATABASE_URL=libsql://medindex-yourname.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# Hugging Face AI Advisor
HUGGINGFACE_API_TOKEN=your_hf_token
HUGGINGFACE_MODEL=Qwen/Qwen2.5-7B-Instruct

# OpenRouter (optional, for web scraper)
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 3. Initialize Turso Database Schema

Run the SQL commands from `turso-schema.sql` in the Turso CLI or Web Dashboard:

```bash
turso db shell medindex < turso-schema.sql
```

Verify your connection and inspect data:
```bash
npm run verify-turso
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Automated Data Pipeline (GitHub Actions)

MedIndex uses GitHub Actions (`.github/workflows/scrape-and-sync-turso.yml`) to keep medical school data up to date automatically:

1. **Schedule**: Runs automatically on the **1st of every month at 02:00 UTC** (or manually via **Actions** → **Run workflow**).
2. **Scraper**: Uses CyberScraper with Playwright and OpenRouter to extract admissions criteria, median stats, and requirements from school websites (`scraper/schools_urls.csv`).
3. **Turso Upsert**: Runs `scraper/import_to_turso.py` to seamlessly update the live database with zero downtime and without duplicates.

### Setting Up GitHub Actions Secrets
In your GitHub repository under **Settings** → **Secrets and variables** → **Actions**, add:
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `OPENROUTER_API_KEY`

---

## Project Structure

```
├── app/
│   ├── advisor/           # AI advisor chat page
│   ├── api/chat/          # AI chat route (Hugging Face)
│   ├── auth/              # Authentication pages
│   ├── compare/           # School comparison tool
│   ├── school/[id]/       # Detailed school profile view
│   ├── search/            # Interactive filter & search interface
│   └── layout.tsx         # Root layout with navigation & theme providers
├── components/
│   ├── ui/                # UI primitives (buttons, dialogs, inputs)
│   ├── NavBar.tsx         # Header navigation
│   ├── SchoolCard.tsx     # Card view for individual schools
│   ├── SchoolFilters.tsx  # Multi-parameter filter sidebar
│   ├── SchoolTable.tsx    # Comparison table
│   └── ChatBox.tsx        # Pre-med advisor chat widget
├── config/
│   └── advisor-instructions.md   # Customizable admissions counseling rules & guidelines
├── lib/
│   ├── pdf.ts             # In-memory ephemeral PDF text extraction
│   ├── turso/             # Turso LibSQL client & database queries
│   │   ├── client.ts      # Lazy-loaded database client
│   │   └── queries.ts     # getSchools, getSchoolById, favorites
│   └── utils.ts           # Class merge helpers
├── scraper/
│   ├── cyberscraper_scraper.py   # Web scraper with Playwright & LLM extraction
│   ├── import_to_turso.py        # CSV to Turso upsert pipeline
│   ├── schools_urls.csv          # Target school directory & URLs
│   └── run_all_schools.sh        # Local runner script
├── .github/
│   └── workflows/
│       ├── ci.yml                        # Code quality & build verification
│       └── scrape-and-sync-turso.yml     # Scheduled monthly scraper & Turso sync
├── scripts/
│   ├── seed.ts            # Seed data source (29 medical schools)
│   └── verify-turso.ts    # Database query verification script
└── turso-schema.sql       # SQLite / Turso database schema
```

---

## License

[MIT](LICENSE)
