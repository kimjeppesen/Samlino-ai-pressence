# Deployment Guide - GitHub & Netlify

## Step 1: Initialize Git Repository

The project has been initialized with Git. To connect to GitHub:

1. **Create a new repository on GitHub**
   - Go to [github.com](https://github.com) and create a new repository
   - Name it something like `ai-visibility-dashboard`
   - **Do NOT** initialize with README, .gitignore, or license (we already have these)

2. **Connect local repository to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: First Commit

Before pushing, make your first commit:

```bash
git add .
git commit -m "Initial commit: AI Visibility Dashboard"
git push -u origin main
```

## Step 3: Deploy to Netlify

### Option A: Connect via Netlify Dashboard (Recommended)

1. **Sign up/Login to Netlify**
   - Go to [netlify.com](https://www.netlify.com)
   - Sign up or log in with your GitHub account

2. **Add New Site**
   - Click "Add new site" > "Import an existing project"
   - Choose "GitHub" and authorize Netlify
   - Select your repository

3. **Configure Build Settings**
   - Netlify will auto-detect from `netlify.toml`:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - Click "Deploy site"

4. **Add Environment Variables**
   - Go to Site settings > Environment variables
   - Add your API keys:
     - `VITE_BRAND_NAME` (optional)
     - `VITE_ANTHROPIC_API_KEY`
     - `VITE_OPENAI_API_KEY`
     - `VITE_PERPLEXITY_API_KEY` (optional)
     - `VITE_GOOGLE_API_KEY` (optional)

5. **Redeploy**
   - After adding environment variables, trigger a new deployment
   - Go to Deploys > Trigger deploy > Deploy site

### Option B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

## Important Notes

### Environment Variables

**Never commit API keys to GitHub!** They should only be:
- Set in Netlify's dashboard (Environment variables)
- Or in `.env.local` file (which is gitignored)

### Build Configuration

The `netlify.toml` file is already configured with:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA routing redirects
- Security headers

### Browser Storage

Since the app uses localStorage, each user's data is stored in their browser. This means:
- Data is not shared between users
- Data persists across sessions
- Data is cleared if user clears browser data

### CORS Considerations

- Claude API requires `anthropic-dangerous-direct-browser-access: true` header (already configured)
- Some APIs may have CORS restrictions when called from browser
- If you encounter CORS issues, consider using Netlify Functions as a proxy

## Troubleshooting

### Build Fails

1. Check Node.js version (should be 18+)
2. Ensure all dependencies are in `package.json`
3. Check Netlify build logs

### Environment Variables Not Working

1. Make sure variable names start with `VITE_`
2. Redeploy after adding variables
3. Check Netlify build logs for errors

### Routing Issues

The `netlify.toml` includes redirect rules for SPA routing. If pages don't load:
- Check that `netlify.toml` is in the root directory
- Verify redirect rules are correct

## Next Steps

1. Push code to GitHub
2. Connect to Netlify
3. Add environment variables
4. Deploy!
5. Share your dashboard URL

Your dashboard will be live at: `https://your-site-name.netlify.app`
