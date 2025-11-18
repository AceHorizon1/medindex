# Netlify Deployment Guide for MedIndex

## Prerequisites

1. **Supabase Setup** (must be done first):
   - Create a Supabase project at https://supabase.com
   - Run the SQL from `supabase-schema.sql` in your Supabase SQL Editor
   - Get your project URL and anon key from Settings → API

2. **GitHub Repository**: Your code should be pushed to GitHub (already done ✅)

## Step-by-Step Netlify Setup

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Sign up/Login to Netlify**
   - Go to https://app.netlify.com
   - Sign up or log in (you can use GitHub to sign in)

2. **Create a New Site**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your GitHub account if prompted
   - Select your repository: `AceHorizon1/medindex`

3. **Configure Build Settings**
   - Netlify should auto-detect Next.js and use your `netlify.toml`
   - Verify these settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `.next`
     - **Node version**: `20` (set in netlify.toml)

4. **Add Environment Variables**
   Before deploying, click "Show advanced" → "New variable" and add:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   Optional (for AI chat):
   ```
   GROK_API_KEY=your_grok_api_key
   # OR
   HUGGINGFACE_API_TOKEN=your_hf_token
   HUGGINGFACE_API_URL=https://api-inference.huggingface.co/models/meta-llama/Llama-3-8b-chat-hf
   ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete (usually 2-5 minutes)
   - Your site will be live at `https://your-site-name.netlify.app`

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```
   This will open a browser to authenticate.

3. **Initialize and Deploy**:
   ```bash
   cd /home/ayaan/Documents/Cursor/MedIndex
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Follow the prompts
   - When asked about build settings, use the defaults (they'll read from netlify.toml)

4. **Set Environment Variables**:
   ```bash
   netlify env:set NEXT_PUBLIC_SUPABASE_URL "your_supabase_project_url"
   netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your_supabase_anon_key"
   ```

5. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

## Post-Deployment Steps

1. **Update Supabase Auth Redirect URLs**:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Netlify URL to "Redirect URLs":
     - `https://your-site-name.netlify.app`
     - `https://your-site-name.netlify.app/auth/callback`

2. **Test Your Deployment**:
   - Visit your Netlify URL
   - Test the search functionality
   - Try signing up/logging in
   - Test the AI advisor chat

3. **Custom Domain (Optional)**:
   - In Netlify Dashboard → Site settings → Domain management
   - Add your custom domain
   - Follow DNS configuration instructions

## Troubleshooting

### Build Fails
- Check build logs in Netlify Dashboard
- Ensure all environment variables are set
- Verify Node version is 20

### Environment Variables Not Working
- Make sure variables starting with `NEXT_PUBLIC_` are set in Netlify
- Redeploy after adding new variables

### Supabase Connection Issues
- Verify your Supabase URL and anon key are correct
- Check Supabase Row Level Security policies
- Ensure redirect URLs are configured in Supabase

### AI Chat Not Working
- Verify your API key is set correctly
- Check API rate limits
- Review browser console for errors

## Continuous Deployment

Once connected to GitHub, Netlify will automatically:
- Deploy when you push to `main` branch
- Create preview deployments for pull requests
- Show build status in your GitHub repository

## Useful Netlify Features

- **Deploy Previews**: Every PR gets a preview URL
- **Split Testing**: Test different versions
- **Forms**: Can add contact forms if needed
- **Functions**: Can add serverless functions for backend tasks
- **Analytics**: Track site performance (paid feature)

## Next Steps

1. Set up Supabase (if not done)
2. Seed your database: `npm run seed` (run locally, then data syncs to Supabase)
3. Configure environment variables in Netlify
4. Deploy!
5. Test all features
6. Share your live site! 🎉

