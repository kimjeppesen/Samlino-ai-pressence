# AI Visibility Dashboard - Integration Guide

## Overview

The AI Visibility Dashboard now supports connecting to real data files and AI model APIs to check for brand presence in AI-generated responses. This guide explains how to set up and use the integration.

## Architecture

### Service Layer

The application includes a comprehensive service layer:

1. **File Reader Service** (`src/lib/services/fileReader.ts`)
   - Reads queries from CSV, TXT files
   - Auto-detects query column
   - Parses and normalizes data

2. **AI Provider Services** (`src/lib/services/aiProviders.ts`)
   - OpenAI (ChatGPT)
   - Anthropic (Claude)
   - Perplexity
   - Google (Gemini)

3. **Brand Detection Service** (`src/lib/services/brandDetection.ts`)
   - Analyzes AI responses for brand mentions
   - Determines sentiment (positive/neutral/negative)
   - Extracts context and position
   - Calculates confidence scores

4. **Query Processor** (`src/lib/services/queryProcessor.ts`)
   - Orchestrates query processing across platforms
   - Handles batch processing
   - Manages rate limiting

5. **Data Storage** (`src/lib/services/dataStorage.ts`)
   - Stores results in localStorage
   - Exports data as JSON/CSV

## Setup Instructions

### 1. Configure Brand Settings

1. Navigate to **Settings** page in the dashboard
2. Enter your **Brand Name**
3. Optionally add **Brand Aliases** (comma-separated)
   - Example: "Your Brand, YourBrand, Brand Inc"

### 2. Configure API Keys

1. Go to **Settings** → **API Keys** tab
2. Enter API keys for the platforms you want to use:

   **OpenAI (ChatGPT)**
   - Get key from: https://platform.openai.com/api-keys
   - Format: `sk-...`

   **Anthropic (Claude)**
   - Get key from: https://console.anthropic.com/
   - Format: `sk-ant-...`

   **Perplexity**
   - Get key from: https://www.perplexity.ai/settings/api
   - Format: `pplx-...`

   **Google (Gemini)**
   - Get key from: https://makersuite.google.com/app/apikey
   - Format: `AIza...`

3. Click **Save Configuration**

> **Security Note**: API keys are stored locally in your browser's localStorage. They are only sent to the respective AI platform APIs, never to external servers.

### 3. Prepare Your Query File

Create a CSV file with your queries:

**CSV Format:**
```csv
query
Best project management software
Alternatives to Monday.com
Team collaboration tools comparison
```

Or include additional columns:
```csv
query,date,category
Best project management software,2024-12-13,software
Alternatives to Monday.com,2024-12-12,alternatives
```

**Supported File Types:**
- CSV (`.csv`) - Recommended
- Text (`.txt`) - One query per line

**File Requirements:**
- Must have a column named: `query`, `prompt`, or `question`
- UTF-8 encoding
- First row should be headers (for CSV)

### 4. Upload and Process Queries

1. Navigate to **Prompts & Queries** page
2. Click **Select File** and choose your query file
3. Review the number of queries detected
4. Click **Process Queries**
5. Monitor progress in real-time
6. Results will appear in the table below

## How It Works

### Processing Flow

1. **File Upload**: Queries are read from your file
2. **API Calls**: Each query is sent to selected AI platforms
3. **Response Analysis**: AI responses are analyzed for:
   - Brand mentions (yes/no)
   - Position in response (1st, 2nd, etc.)
   - Sentiment (positive/neutral/negative)
   - Context (excerpt showing the mention)
   - Confidence score
4. **Data Storage**: Results are saved to browser localStorage
5. **Display**: Results appear in the dashboard tables and charts

### Brand Detection Algorithm

The system uses pattern matching and sentiment analysis:

1. **Mention Detection**: Searches for brand name and aliases (case-insensitive)
2. **Position Calculation**: Finds the first mention position
3. **Sentiment Analysis**: Analyzes surrounding context for:
   - Positive words: "best", "excellent", "recommended", etc.
   - Negative words: "worst", "poor", "issues", etc.
4. **Confidence Scoring**: Based on mention count and context quality

### Rate Limiting

- 1 second delay between individual API calls
- 2 second delay between query batches
- Batch size: 3 queries (configurable)

## Data Structure

### Query Result Format

```typescript
{
  id: string;
  query: string;
  platform: 'ChatGPT' | 'Claude' | 'Perplexity' | 'Gemini';
  mentioned: boolean;
  position: number | null; // 1 = first mention
  sentiment: 'positive' | 'neutral' | 'negative';
  date: string; // YYYY-MM-DD
  context: string; // Excerpt from response
  confidence?: number; // 0-1
}
```

## Exporting Results

Results are automatically saved to localStorage. To export:

1. Results are stored in browser localStorage
2. Use browser DevTools → Application → Local Storage
3. Look for key: `ai-visibility-query-results`

## Troubleshooting

### API Errors

- **401 Unauthorized**: Check API key is correct
- **429 Rate Limit**: Wait a few minutes, reduce batch size
- **500 Server Error**: Platform may be down, try later

### File Reading Errors

- **No query column found**: Ensure CSV has column named "query", "prompt", or "question"
- **Empty file**: Check file has content and proper encoding
- **Unsupported format**: Convert to CSV or TXT

### Brand Not Detected

- Check brand name spelling in Settings
- Add brand aliases if brand appears with variations
- Review AI response manually to verify

## Best Practices

1. **Start Small**: Test with 5-10 queries first
2. **Monitor Costs**: API calls have costs, especially GPT-4
3. **Use Appropriate Models**: 
   - GPT-3.5-turbo is cheaper than GPT-4
   - Claude Opus is more expensive than Claude Haiku
4. **Batch Processing**: Process queries in batches to avoid rate limits
5. **Save Regularly**: Results are auto-saved, but export important data

## Security Considerations

- API keys are stored in browser localStorage (not encrypted)
- Keys are only sent to respective AI platform APIs
- Consider using environment variables for production
- Don't share your API keys or commit them to version control

## Next Steps

- Add support for Excel files (requires xlsx library)
- Implement backend API for secure key storage
- Add scheduled processing
- Export to database
- Add more AI platforms

## Support

For issues or questions, check:
- Browser console for error messages
- Network tab for API call details
- Local storage for saved data
