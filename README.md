# AI Visibility Dashboard

A comprehensive dashboard for tracking your brand's visibility across AI platforms (ChatGPT, Claude, Perplexity, Gemini). Monitor mentions, analyze competitor presence, and track performance metrics over time.

## Features

- **Multi-Platform Support**: Track brand mentions across ChatGPT, Claude, Perplexity, and Gemini
- **Query Management**: Store and organize queries with categories and intents
- **Competitor Tracking**: Monitor competitor mentions in AI responses
- **URL Extraction**: Automatically extract URLs when your brand is mentioned
- **Historical Tracking**: Track performance trends over time with weekly snapshots
- **Crawl Management**: View results by individual crawls with date range filtering
- **Category & Intent Filtering**: Organize and filter queries by custom categories and intents
- **Real-time Processing**: Process queries through multiple AI platforms simultaneously

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Recharts** for data visualization
- **React Router** for navigation
- **LocalStorage** for data persistence

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd "AI Pressence"
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file (optional) for API keys:
```env
VITE_BRAND_NAME=YourBrand
VITE_ANTHROPIC_API_KEY=your-claude-api-key
VITE_OPENAI_API_KEY=your-openai-api-key
VITE_PERPLEXITY_API_KEY=your-perplexity-api-key
VITE_GOOGLE_API_KEY=your-google-api-key
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Configuration

### Setting Up API Keys

1. Go to the **Settings** page in the application
2. Enter your API keys for the platforms you want to use:
   - **Anthropic (Claude)**: Get from [console.anthropic.com](https://console.anthropic.com/)
   - **OpenAI (ChatGPT)**: Get from [platform.openai.com](https://platform.openai.com/api-keys)
   - **Perplexity**: Get from [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)
   - **Google (Gemini)**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. Click **Save Configuration**

### Default Models

- **Claude**: `claude-3-5-haiku-20241022` (Haiku 4.5)
- **OpenAI**: `gpt-5-nano` (GPT-5 Nano)
- **Language**: Danish (Denmark) - configured by default

### Brand Configuration

Default brand: **Samlino** with aliases:
- Samlino
- samlino
- samlino.dk
- samlino dk

Default competitors:
- findforsikring
- fdm
- alm. brand

You can change these in the Settings page.

## Usage

### Managing Queries

1. Go to **Prompts & Queries** page
2. Click **Add Query** to manually add queries
3. Assign **Categories** and **Intents** to organize queries
4. Use the **Search** bar to find specific queries
5. Select queries and click **Run** to process them

### Processing Queries

1. Select queries (or leave unselected to run all)
2. Click **Run** button
3. The system will process queries through all configured AI platforms
4. Results are saved as a new crawl with a unique ID

### Viewing Results

- **Overview**: See KPIs, platform performance, and trends
- **Prompts & Queries**: View detailed query results
- **Platforms**: Platform-specific performance metrics
- **Competitors**: Compare your brand against competitors

### Crawl Management

- Use the **Crawl Selector** to view results from specific crawls
- Each crawl is preserved separately (never overwritten)
- Use date range filters on charts to view trends over time

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── dashboard/     # Dashboard components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # UI components (Radix UI)
│   ├── hooks/             # Custom React hooks
│   ├── lib/
│   │   ├── services/      # Business logic services
│   │   ├── types.ts       # TypeScript types
│   │   └── utils.ts       # Utility functions
│   └── pages/             # Page components
├── public/                 # Static assets
└── dist/                   # Build output (generated)
```

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory, ready for deployment.

## Deployment to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Netlify will automatically detect the build settings from `netlify.toml`
4. Add environment variables in Netlify dashboard (Settings > Environment variables)
5. Deploy!

### Netlify Environment Variables

Add these in Netlify dashboard:
- `VITE_BRAND_NAME`
- `VITE_ANTHROPIC_API_KEY`
- `VITE_OPENAI_API_KEY`
- `VITE_PERPLEXITY_API_KEY`
- `VITE_GOOGLE_API_KEY`

**Note**: For security, API keys should be set in Netlify's environment variables, not committed to the repository.

## Data Storage

All data is stored in browser localStorage:
- Queries: `ai-visibility-stored-queries`
- Categories: `ai-visibility-query-categories`
- Intents: `ai-visibility-query-intents`
- Crawls: `ai-visibility-crawls`
- Configuration: `ai-visibility-config`

## Features in Detail

### Query Management
- Persistent storage of queries
- Category and intent organization
- Search and filter capabilities
- Pagination (20 queries per page)
- Alphabetical sorting

### Crawl System
- Each processing run creates a new crawl
- Crawls are never overwritten
- View results by individual crawl or all combined
- Date range filtering for trend analysis

### Competitor Tracking
- Automatic detection of competitor mentions
- Visibility scoring
- Comparison metrics
- Gap analysis

### URL Extraction
- Automatically extracts URLs from AI responses
- Only when brand is mentioned
- Clickable links in results table

## License

Private project - All rights reserved

## Support

For issues or questions, please check the documentation files:
- `INTEGRATION_GUIDE.md` - Setup and integration
- `TROUBLESHOOTING.md` - Common issues and solutions
- `QUERY_MANAGEMENT_SYSTEM.md` - Query management details
