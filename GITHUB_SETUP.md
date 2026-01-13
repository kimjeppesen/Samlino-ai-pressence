# GitHub Setup Instructions

Your project is now ready for GitHub! Here's what has been set up:

## ✅ What's Been Configured

1. **Git Repository**: Initialized with `.git/`
2. **`.gitignore`**: Updated to exclude:
   - `node_modules/`
   - `dist/` (build output)
   - `.env*` files (API keys)
   - Editor files
   - Netlify files

3. **`netlify.toml`**: Netlify deployment configuration
   - Build command: `npm run build`
   - Publish directory: `dist`
   - SPA routing redirects
   - Security headers

4. **`README.md`**: Updated with comprehensive documentation

5. **`DEPLOYMENT.md`**: Step-by-step deployment guide

6. **`.gitattributes`**: Line ending normalization for cross-platform compatibility

7. **`.github/workflows/netlify-deploy.yml`**: Optional GitHub Actions workflow

## 🚀 Next Steps

### 1. Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right > **"New repository"**
3. Repository name: `ai-visibility-dashboard` (or your preferred name)
4. Description: "AI Visibility Dashboard - Track brand presence across AI platforms"
5. Choose **Private** or **Public**
6. **DO NOT** check "Initialize with README" (we already have one)
7. Click **"Create repository"**

### 2. Connect Local Repository to GitHub

Run these commands in your terminal:

```bash
cd "/Users/samlino/Samlino/AI Pressence"

# Add GitHub remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Stage all files
git add .

# Create initial commit
git commit -m "Initial commit: AI Visibility Dashboard

- Complete React + TypeScript dashboard
- Multi-platform AI integration (Claude, ChatGPT, Perplexity, Gemini)
- Query management system with categories and intents
- Historical tracking and crawl management
- Competitor tracking and URL extraction
- Netlify deployment ready"

# Push to GitHub
git push -u origin main
```

### 3. Deploy to Netlify

#### Option A: Via Netlify Dashboard (Easiest)

1. **Sign up/Login to Netlify**
   - Go to [netlify.com](https://www.netlify.com)
   - Click "Sign up" and choose "GitHub"
   - Authorize Netlify to access your GitHub account

2. **Import Your Site**
   - Click **"Add new site"** > **"Import an existing project"**
   - Choose **"GitHub"**
   - Select your repository: `ai-visibility-dashboard`
   - Netlify will auto-detect settings from `netlify.toml`:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click **"Deploy site"**

3. **Add Environment Variables**
   - Go to **Site settings** > **Environment variables**
   - Click **"Add variable"** and add:
     ```
     VITE_BRAND_NAME = Samlino
     VITE_ANTHROPIC_API_KEY = sk-ant-api03-...
     VITE_OPENAI_API_KEY = sk-proj-...
     VITE_PERPLEXITY_API_KEY = pplx-... (if you have one)
     VITE_GOOGLE_API_KEY = ... (if you have one)
     ```
   - Click **"Save"**

4. **Redeploy**
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** > **"Deploy site"**
   - Wait for deployment to complete

5. **Your Site is Live!**
   - Your dashboard will be available at: `https://your-site-name.netlify.app`
   - You can change the site name in **Site settings** > **General** > **Site details**

#### Option B: Via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site (follow prompts)
netlify init

# Deploy to production
netlify deploy --prod
```

## 🔒 Security Notes

### Important: API Keys

- **Never commit API keys to GitHub!**
- API keys should only be:
  - Set in Netlify's Environment Variables (recommended)
  - Or in `.env.local` file (which is gitignored)

### What's Protected

The `.gitignore` file ensures these are NOT committed:
- ✅ `.env*` files (all environment files)
- ✅ `node_modules/` (dependencies)
- ✅ `dist/` (build output)
- ✅ `*.key`, `*.pem` (key files)
- ✅ `.netlify/` (Netlify cache)

## 📝 Files Ready for GitHub

All project files are staged and ready to commit:
- ✅ Source code (`src/`)
- ✅ Configuration files (`package.json`, `tsconfig.json`, etc.)
- ✅ Documentation (`.md` files)
- ✅ Netlify configuration (`netlify.toml`)
- ✅ GitHub Actions workflow (`.github/workflows/`)

## 🎯 Quick Reference

### Git Commands

```bash
# Check status
git status

# See what will be committed
git status --short

# Add all files
git add .

# Commit
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main
```

### Netlify Commands

```bash
# Deploy preview
netlify deploy

# Deploy to production
netlify deploy --prod

# Open Netlify dashboard
netlify open
```

## 🐛 Troubleshooting

### "Repository not found"
- Check that you've created the repository on GitHub
- Verify the repository name matches
- Ensure you have access to the repository

### "Permission denied"
- Make sure you're authenticated with GitHub
- Use `gh auth login` if using GitHub CLI
- Or use HTTPS with personal access token

### Build fails on Netlify
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check Netlify build logs for errors
- Ensure environment variables are set correctly

### Environment variables not working
- Variables must start with `VITE_` to be accessible in Vite
- Redeploy after adding variables
- Check Netlify build logs

## 📚 Additional Resources

- [GitHub Docs](https://docs.github.com/)
- [Netlify Docs](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

## ✨ You're All Set!

Once you've:
1. ✅ Created GitHub repository
2. ✅ Pushed your code
3. ✅ Connected to Netlify
4. ✅ Added environment variables
5. ✅ Deployed

Your AI Visibility Dashboard will be live on the web! 🎉
