# What Happens When a New Data File is Scanned

## Complete Process Flow

### 1. File Upload & Parsing

**Location**: `QueryUploader.tsx` → `handleFileSelect()`

**What happens:**
- User selects CSV or TXT file
- File is read using `readQueryFile()` service
- Queries are parsed into objects:
  ```typescript
  {
    id: "query-1",
    query: "Bilforsikring",
    date: "2024-01-15"
  }
  ```
- File name and query count displayed
- Ready to process

### 2. Query Processing

**Location**: `QueryUploader.tsx` → `handleProcess()` → `useQueryProcessor.ts`

**What happens:**
1. **API Key Check**: Verifies Claude API key is configured
2. **Batch Processing**: Queries processed in batches of 3 (configurable)
3. **For Each Query**:
   - Sent to each configured AI platform (Claude, ChatGPT, etc.)
   - AI responds naturally (as if user typed it)
   - Response analyzed for brand mentions
   - Result stored

**Processing Details:**
- **Delay between queries**: 1 second (rate limiting)
- **Delay between batches**: 2 seconds
- **Progress tracking**: Shows "X / Y queries processed"
- **Error handling**: Continues even if some queries fail

### 3. Brand Detection

**Location**: `brandDetection.ts` → `analyzeBrandPresence()`

**For each AI response:**
1. **Text Search**: Searches for brand name and aliases
   - Brand: "Samlino"
   - Aliases: ["Samlino", "samlino", "samlino.dk", "samlino dk"]
2. **Position Detection**: Finds where brand is mentioned
3. **Context Extraction**: Gets 50 chars before/after mention
4. **Sentiment Analysis**: Analyzes context for positive/negative words
5. **Confidence Calculation**: Based on mention count and response length

**Result stored:**
```typescript
{
  mentioned: true,
  position: 1,
  sentiment: "positive",
  context: "...Samlino er en populær platform...",
  confidence: 0.8
}
```

### 4. Data Storage

**Location**: `dataStorage.ts` → `saveQueryResults()`

**What happens:**
1. Load existing results from localStorage
2. Combine with new results
3. Remove duplicates (based on result ID)
4. Save to localStorage key: `ai-visibility-query-results`
5. Trigger `queryDataUpdated` event

**Storage format:**
- JSON array of `QueryResult` objects
- Each result includes: query, platform, mentioned, position, sentiment, date, context, fullResponse

### 5. Historical Snapshot Creation ⭐ NEW

**Location**: `useQueryProcessor.ts` → `historicalTracking.ts`

**What happens:**
1. After all queries processed, **snapshot is automatically created**
2. Snapshot includes:
   - Current date and week number
   - All KPIs (visibility, mentions, sentiment, rank)
   - Platform-specific metrics
   - Competitor metrics
3. **Saved to localStorage**: `ai-visibility-historical-snapshots`
4. **Week-based**: If snapshot for current week exists, it's **replaced** (not duplicated)

**Snapshot structure:**
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
  platformMetrics: [
    { platform: "Claude", visibility: 75, mentions: 20, sentiment: 70 },
    { platform: "ChatGPT", visibility: 70, mentions: 15, sentiment: 65 },
    ...
  ],
  competitorMetrics: [
    { name: "Samlino", visibility: 72, mentions: 45, sentiment: 68 },
    { name: "findforsikring", visibility: 85, mentions: 60, sentiment: 75 },
    ...
  ]
}
```

### 6. Dashboard Update

**Location**: All dashboard components listen for `queryDataUpdated` event

**What updates:**
1. **KPI Cards** (`Overview.tsx`):
   - Load current results
   - Calculate metrics
   - **Compare with previous snapshot** ⭐ NEW
   - Show change indicators (+5, -3, etc.)
   - Display trend arrows (↑ ↓ →)

2. **Charts** (`VisibilityChart.tsx`, `MentionsChart.tsx`):
   - Load current results
   - **Load historical snapshots** ⭐ NEW
   - Display trends (last 12 weeks)
   - Show current week as "Current" data point

3. **Platform Cards**:
   - Show current metrics
   - **Show change vs previous week** ⭐ NEW

4. **Query Table**:
   - Display all processed results
   - Show latest queries first

## Key Differences: Before vs After

### Before (Old System)
- ❌ No historical tracking
- ❌ KPIs showed `change: 0` (no comparison)
- ❌ Charts showed only current data point
- ❌ No way to see progress/decline
- ❌ Each scan replaced all data

### After (New System) ⭐
- ✅ **Automatic weekly snapshots**
- ✅ **KPIs show change vs previous week**
- ✅ **Charts show 12-week trends**
- ✅ **Clear indicators of improvements/declines**
- ✅ **Week-based tracking** (one snapshot per week)

## Weekly Workflow

### First Run (Week 1)
1. Upload queries → Process → Snapshot created
2. KPIs show current values (no comparison yet)
3. Charts show single data point

### Second Run (Week 2)
1. Upload queries → Process → New snapshot created
2. **KPIs automatically compare Week 2 vs Week 1**
3. Charts show 2 data points (Week 1 → Week 2)
4. See improvements/declines immediately

### Subsequent Runs (Week 3+)
1. Each week creates new snapshot
2. **Always compares current vs previous week**
3. Charts show full trend history (up to 12 weeks)
4. Track long-term progress

## Data Persistence

### What's Stored
1. **Query Results**: All processed query results
   - Key: `ai-visibility-query-results`
   - Persists across sessions
   - Can be cleared via "Clear Data" button

2. **Historical Snapshots**: Weekly metric snapshots
   - Key: `ai-visibility-historical-snapshots`
   - Up to 52 weeks (1 year)
   - Auto-cleanup of old data
   - Can be cleared via "Clear Data" button

### Data Location
- **Browser localStorage** (client-side only)
- **Not sent to any server**
- **Persists until cleared** or browser data cleared

## Error Handling

### If Processing Fails
- Error message displayed
- Partial results still saved (if any)
- No snapshot created (only on successful completion)
- Can retry processing

### If API Calls Fail
- Individual query failures logged
- Processing continues with other queries
- Successful results still saved
- Snapshot created with available data

## Performance Considerations

### Processing Time
- **~1-2 seconds per query** (API call + analysis)
- **Batch of 3 queries**: ~3-6 seconds
- **100 queries**: ~2-3 minutes total
- Progress bar shows real-time status

### Storage Limits
- **localStorage limit**: ~5-10MB (browser dependent)
- **52 snapshots**: ~500KB (estimated)
- **Query results**: Depends on number of queries
- **Auto-cleanup**: Oldest snapshots removed when limit reached

## Summary

**When you scan a new file:**
1. ✅ Queries are processed through AI platforms
2. ✅ Brand mentions are detected and analyzed
3. ✅ Results are stored
4. ✅ **Weekly snapshot is automatically created** ⭐
5. ✅ **Dashboard shows comparison with previous week** ⭐
6. ✅ **Charts display historical trends** ⭐
7. ✅ **Clear indicators show what improved/declined** ⭐

**The system now has "memory" and tracks your progress over time!**
