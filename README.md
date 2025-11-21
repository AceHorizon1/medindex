# MedIndex

A full-stack Next.js 14 application for pre-med students to search, compare, and get AI-guided insights on U.S. MD/DO medical schools.

## Features

- **Comprehensive School Database**: Search and filter 20+ medical schools by GPA, MCAT, tuition, type (MD/DO), and required courses
- **School Profiles**: Detailed pages with requirements, stats, tuition, mission statements, deadlines, and external links
- **Side-by-Side Comparison**: Compare two schools with detailed metrics
- **AI-Powered Advisor**: Chat with an AI advisor powered by Hugging Face (Qwen2.5-7B-Instruct)
- **Dark Mode**: Toggle between light and dark themes
- **Authentication**: Save favorite schools with Supabase Auth
- **Responsive Design**: Mobile-friendly UI built with TailwindCSS and shadcn components

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: TailwindCSS + shadcn/ui
- **AI**: Hugging Face Inference API (Qwen2.5-7B-Instruct)
- **Deployment**: Netlify (frontend), Render (backend if needed)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Create a new Supabase project at https://supabase.com
   - Run this SQL in the Supabase SQL editor:

   ```sql
   -- Create schools table
   CREATE TABLE schools (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT UNIQUE NOT NULL,
     type TEXT NOT NULL CHECK (type IN ('MD', 'DO')),
     location TEXT NOT NULL,
     tuition INTEGER,
     avg_gpa NUMERIC(3,2),
     avg_mcat INTEGER,
     required_courses TEXT[],
     mission TEXT,
     deadlines JSONB,
     link TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create favorites table
   CREATE TABLE favorites (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(user_id, school_id)
   );

   -- Enable Row Level Security
   ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
   ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

   -- Policies for schools (public read)
   CREATE POLICY "Schools are viewable by everyone" ON schools
     FOR SELECT USING (true);

   -- Policies for favorites
   CREATE POLICY "Users can view own favorites" ON favorites
     FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can insert own favorites" ON favorites
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can delete own favorites" ON favorites
     FOR DELETE USING (auth.uid() = user_id);
   ```

3. **Get a Hugging Face API Token**:
   - Go to https://huggingface.co/settings/tokens
   - Create a new token with "Read" permissions
   - Copy the token

4. **Configure environment variables**:
   - Create a `.env.local` file in the root directory
   - Add your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - Add your Hugging Face API token:
     ```
     HUGGINGFACE_API_TOKEN=your_hf_token
     ```
   - Optionally customize the model (defaults to Qwen2.5-7B-Instruct):
     ```
     HUGGINGFACE_MODEL=Qwen/Qwen2.5-7B-Instruct
     ```

5. **Seed the database**:
   ```bash
   npm run seed
   ```

6. **Run the development server**:
   ```bash
   npm run dev
   ```

7. **Open** [http://localhost:3000](http://localhost:3000)

## AI Model Configuration

The app uses Hugging Face's Inference Providers API, which provides:
- **Automatic provider selection**: The API automatically routes requests to the best available provider
- **OpenAI-compatible API**: Works seamlessly with streaming chat completions
- **Free tier available**: Many models have free inference options

**Default Model**: `Qwen/Qwen2.5-7B-Instruct`
- High-quality conversational model
- Good for medical school advising
- Free inference available

**Alternative Models** (you can change via `HUGGINGFACE_MODEL` env var):
- `mistralai/Mistral-7B-Instruct-v0.2`
- `meta-llama/Llama-3.1-8B-Instruct`
- `Qwen/Qwen2.5-14B-Instruct` (larger, more capable)

## Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `HUGGINGFACE_API_TOKEN`
   - `HUGGINGFACE_MODEL` (optional)
5. Deploy!

The `netlify.toml` file is already configured.

## Project Structure

```
├── app/
│   ├── api/chat/          # AI chat API route (Hugging Face)
│   ├── auth/              # Authentication pages
│   ├── compare/           # School comparison page
│   ├── school/[id]/       # Individual school profile
│   ├── search/            # School search page
│   ├── advisor/           # AI advisor chat page
│   └── layout.tsx         # Root layout with NavBar
├── components/
│   ├── ui/                # shadcn components
│   ├── NavBar.tsx         # Navigation component
│   ├── SchoolCard.tsx     # School card component
│   ├── SchoolFilters.tsx  # Filter component
│   ├── SchoolTable.tsx    # Comparison table
│   ├── ChatBox.tsx        # AI chat component
│   ├── ThemeProvider.tsx  # Dark mode provider
│   ├── ThemeToggle.tsx    # Dark mode toggle
│   └── Footer.tsx         # Footer component
├── lib/
│   ├── supabase/          # Supabase client & queries
│   └── utils.ts            # Utility functions
└── scripts/
    └── seed.ts            # Database seed script
```

## License

MIT
