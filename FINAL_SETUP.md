# Final Setup Instructions

## Quick Start

### 1. Set Up API Keys

**Option A: Environment Variables (Recommended for Production)**
1. Copy `.env.example` to `.env`
2. Add your API keys:
   ```env
   VITE_ANTHROPIC_API_KEY=sk-ant-your-claude-key-here
   VITE_OPENAI_API_KEY=sk-your-openai-key-here
   VITE_PERPLEXITY_API_KEY=pplx-your-key-here
   VITE_GOOGLE_API_KEY=AIza-your-key-here
   VITE_BRAND_NAME=Bilforsikring
   ```

**Option B: Settings Page (For Testing)**
1. Start the application: `npm run dev`
2. Navigate to Settings page
3. Enter API keys in the UI
4. Click "Save Configuration"

### 2. Configure Brand

The default brand is set to **"Bilforsikring"** with aliases:
- bilforsikring
- bil forsikring

You can change this in Settings → Brand tab.

### 3. Test with Sample Data

1. Go to **Prompts & Queries** page
2. Upload `sample-queries.csv` (contains Norwegian car insurance queries)
3. Click **Process Queries**
4. Results will appear in the table

## Sample Queries Included

The sample data files now contain Norwegian car insurance queries:
- Bilforsikring
- Billig bilforsikring
- Hvem har den billigste bilforsikring
- Hvordan får jeg en billigere bilforsikring

## Default Configuration

- **Brand Name**: Bilforsikring
- **Brand Aliases**: bilforsikring, bil forsikring
- **Default Model**: Claude 3 Opus (if API key provided)

## Production Deployment

1. Set environment variables in your hosting platform
2. Build the application: `npm run build`
3. Deploy the `dist` folder
4. Ensure environment variables are set in production

## Security Notes

- API keys in `.env` are included in the build (Vite bundles them)
- For production, consider using a backend API to store keys securely
- Never commit `.env` file to version control (already in .gitignore)

## Troubleshooting

- **API Key Not Working**: Check key format and ensure it's valid
- **Queries Not Processing**: Verify API keys are set correctly
- **No Results**: Check browser console for error messages
- **Brand Not Detected**: Verify brand name matches exactly (case-insensitive)
