# Weekly Tracking & Historical Comparison System

## Overview

The application now includes a **historical tracking system** that saves weekly snapshots of your metrics, allowing you to see progress and declines over time.

## What Happens When You Upload a New Data File

### Step-by-Step Process

1. **File Upload** (`QueryUploader.tsx`)
   - User selects CSV/TXT file with queries
   - File is parsed into query objects
   - Queries are ready to process

2. **Query Processing** (`useQueryProcessor.ts`)
   - Each query is sent to AI platforms (Claude, ChatGPT, etc.)
   - AI responses are analyzed for brand mentions
   - Results are stored in localStorage

3. **Snapshot Creation** (`historicalTracking.ts`)
   - After processing completes, a **snapshot** is automatically created
   - Snapshot includes:
     - Timestamp and date
     - Week number (YYYY-WW format, e.g., "2024-15")
     - All KPIs (visibility, mentions, sentiment, rank)
     - Platform-specific metrics
     - Competitor metrics

4. **Snapshot Storage**
   - Saved to localStorage with key `ai-visibility-historical-snapshots`
   - If a snapshot for the current week already exists, it's **replaced** (not duplicated)
   - Keeps up to 52 weeks (1 year) of data
   - Oldest snapshots are automatically removed when limit is reached

5. **Dashboard Update**
   - All KPIs now show **change vs previous week**
   - Charts display **historical trends** (last 12 weeks)
   - Green/red indicators show improvements/declines

## Key Features

### 1. Automatic Snapshot Creation

**When:** After each successful query processing run

**What's Saved:**
```typescript
{
  id: "snapshot-2024-01-15T10:30:00Z",
  timestamp: "2024-01-15T10:30:00Z",
  date: "2024-01-15",
  week: "2024-03",  // Week 3 of 2024
  metrics: {
    overallVisibility: 72,
    totalMentions: 45,
    avgSentiment: 68,
    competitorRank: 2,
    totalQueries: 100
  },
  platformMetrics: [...],
  competitorMetrics: [...]
}
```

### 2. Weekly Comparison

**KPI Cards Now Show:**
- **Current Value**: Your current metric
- **Change**: Difference from last week (+5, -3, etc.)
- **Trend**: Up (↑), Down (↓), or Stable (→)
- **Description**: "vs last week: +5" or "vs last week: ↓ 1" (for rank)

**Example:**
```
Overall Visibility: 72/100
Change: +5 (vs last week: +5)
Trend: ↑ (improving)
```

### 3. Historical Charts

**Visibility Chart:**
- Shows visibility trends for each platform over last 12 weeks
- X-axis: Dates (weekly)
- Y-axis: Visibility score (0-100)
- Multiple lines: One per platform (ChatGPT, Claude, Perplexity, Gemini)

**Mentions Chart:**
- Shows mention volume trends over last 12 weeks
- X-axis: Dates (weekly)
- Y-axis: Number of mentions
- Area chart showing growth/decline

### 4. Week-Based Tracking

- Each snapshot is tagged with a **week number** (ISO week format)
- If you run multiple times in the same week, the snapshot is **updated** (not duplicated)
- This ensures you have one snapshot per week for clean trend analysis

## How to Use Weekly Tracking

### Running Weekly Scans

1. **Every Week** (e.g., every Monday):
   - Upload your query file
   - Click "Process Queries"
   - Wait for processing to complete
   - **Snapshot is automatically saved**

2. **View Progress**:
   - Go to **Overview** page
   - Check KPI cards for change indicators
   - Review charts for trends
   - See which metrics improved/declined

3. **Compare Weeks**:
   - Charts show last 12 weeks automatically
   - Hover over data points to see exact values
   - Compare current week vs previous weeks

### Understanding the Data

**Improvements (Green/Up Arrow):**
- Visibility increased
- Mentions increased
- Sentiment improved
- Rank improved (lower number = better)

**Declines (Red/Down Arrow):**
- Visibility decreased
- Mentions decreased
- Sentiment worsened
- Rank worsened (higher number = worse)

**Stable (No Change):**
- Metrics stayed the same
- No significant change from last week

## Technical Details

### Storage

- **Location**: Browser localStorage
- **Key**: `ai-visibility-historical-snapshots`
- **Format**: JSON array of snapshots
- **Limit**: 52 snapshots (1 year)
- **Auto-cleanup**: Oldest snapshots removed when limit reached

### Snapshot Structure

```typescript
interface HistoricalSnapshot {
  id: string;                    // Unique ID
  timestamp: string;             // ISO timestamp
  date: string;                  // YYYY-MM-DD
  week: string;                  // YYYY-WW (e.g., "2024-15")
  metrics: {
    overallVisibility: number;
    totalMentions: number;
    avgSentiment: number;
    competitorRank: number;
    totalQueries: number;
  };
  platformMetrics: Array<{
    platform: string;
    visibility: number;
    mentions: number;
    sentiment: number;
  }>;
  competitorMetrics: Array<{
    name: string;
    visibility: number;
    mentions: number;
    sentiment: number;
  }>;
}
```

### Comparison Logic

**Location**: `historicalTracking.ts` → `compareWithPrevious()`

**How it works:**
1. Creates snapshot from current results
2. Loads previous snapshot (if exists)
3. Compares each metric
4. Calculates change and trend
5. Returns comparison object

**Trend Calculation:**
- `current > previous` → `'up'` (improving)
- `current < previous` → `'down'` (declining)
- `current === previous` → `'stable'` (no change)

**Special Case - Rank:**
- Rank is **inverted** (lower = better)
- So trend is calculated as: `previous > current` → `'up'` (improved)

## Best Practices

1. **Run Weekly**: Process queries on the same day each week for consistent tracking
2. **Use Same Queries**: Keep your query file consistent to ensure fair comparison
3. **Review Trends**: Check charts regularly to spot patterns
4. **Action on Declines**: If metrics decline, investigate why (AI training updates, competitor changes, etc.)

## Clearing Historical Data

To clear all historical snapshots:
```javascript
// In browser console
localStorage.removeItem('ai-visibility-historical-snapshots');
```

Or use the "Clear Data" button (this clears both query results AND historical snapshots).

## Future Enhancements

Potential improvements:
- Export historical data as CSV
- Compare specific date ranges
- Set custom comparison periods (vs last month, vs 3 months ago)
- Email alerts for significant changes
- Historical data backup/restore

---

**The system now provides a complete view of your brand's AI visibility over time, making it easy to track progress and identify trends.**
