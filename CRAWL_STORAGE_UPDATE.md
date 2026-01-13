# Crawl Storage & Feature Updates

## Summary of Changes

This update implements a database-like crawl storage system, adds date range filters to charts, removes date parsing from CSV input, and removes sentiment analysis.

## 1. Crawl Storage System (No Overwrite)

### New Service: `crawlStorage.ts`
- **Purpose**: Store each crawl as a separate entity with unique IDs
- **Key Features**:
  - Each crawl gets a unique ID: `crawl-{timestamp}-{random}`
  - Crawls are never overwritten - new crawls are appended
  - Stores metadata: timestamp, date, result count, platforms
  - Supports up to 1000 crawls (configurable)

### Functions:
- `saveCrawl(results)`: Saves a new crawl (never overwrites)
- `loadAllCrawls()`: Loads all crawls sorted by date (newest first)
- `getCrawlById(crawlId)`: Get specific crawl
- `getLatestCrawl()`: Get most recent crawl
- `getAllResults()`: Get all results from all crawls
- `getCrawlResults(crawlId)`: Get results from specific crawl
- `getCrawlsInRange(startDate, endDate)`: Get crawls in date range
- `getCrawlSummaries()`: Get summary info for UI

### Storage Key:
- `ai-visibility-crawls` in localStorage

## 2. Crawl Selector in Overview

### New Component: `CrawlSelector.tsx`
- Dropdown to select which crawl to view
- Options:
  - "All Crawls (Combined)" - shows all results
  - Individual crawls with date/time and result count
- Displays total number of crawls

### Updated: `Overview.tsx`
- Added `CrawlSelector` component
- Uses `useQueryData(selectedCrawlId)` to filter results
- When a crawl is selected, only that crawl's results are shown
- When "All Crawls" is selected, all results are combined

## 3. Date Range Filters for Charts

### Updated: `VisibilityChart.tsx`
- Added date range selector dropdown
- Options: "Last Month", "Last 3 Months", "Last Year", "All Time"
- Chart data filtered by selected range
- Uses `getCrawlsInRange()` to get relevant crawls

### Updated: `MentionsChart.tsx`
- Added same date range selector
- Filters mention data by date range
- Shows mention count per crawl in selected range

## 4. Removed Date Logic from CSV Input

### Updated: `fileReader.ts`
- CSV parser now **ignores** date columns
- Skips any column with "date" or "time" in the header name
- Only extracts query text
- Date is set during processing (current date)

### Updated: `QueryUploader.tsx`
- Removed date parsing from query objects
- Queries no longer have a `date` field during upload
- Date is assigned during processing

### Updated: `queryProcessor.ts`
- All results get current date: `new Date().toISOString().split('T')[0]`
- Date comes from crawl timestamp, not CSV

## 5. Removed Sentiment Analysis

### Updated: `brandDetection.ts`
- Removed `analyzeSentiment()` function
- Removed `determineOverallSentiment()` function
- All sentiment values are now hardcoded to `'neutral'`
- Mentions array no longer includes sentiment field

### Updated: `types.ts`
- `BrandPresenceAnalysis.mentions` no longer has `sentiment` field
- Sentiment field kept in interface for backward compatibility (always 'neutral')

### Updated: `QueryTable.tsx`
- Removed sentiment column from table
- Removed sentiment icons and styling
- Removed unused imports (`Minus` icon)

### Updated: `queryProcessor.ts`
- All results have `sentiment: 'neutral'`

## 6. Updated Data Storage

### Updated: `dataStorage.ts`
- `saveQueryResults()` now uses `saveCrawl()` internally
- Maintains backward compatibility with legacy storage
- `clearStoredData()` also clears crawl storage

## 7. Updated Hooks

### Updated: `useQueryData.ts`
- Now accepts optional `selectedCrawlId` parameter
- Returns `crawlSummaries` for UI display
- Loads results based on crawl selection:
  - If `selectedCrawlId` provided: loads that crawl's results
  - If `null`: loads all results from all crawls

## Migration Notes

### Existing Data
- Old data in `ai-visibility-query-results` will still work
- New crawls will be stored separately
- To migrate old data to crawl system, process queries again

### Backward Compatibility
- Legacy storage key still maintained
- Old data can still be loaded
- New system is additive (doesn't break old data)

## Usage

### Processing Queries
1. Upload CSV file (no date column needed)
2. Process queries
3. Results are saved as a new crawl with unique ID
4. Previous crawls remain untouched

### Viewing Data
1. Go to Overview page
2. Use Crawl Selector to choose:
   - "All Crawls" to see combined results
   - Specific crawl to see that crawl's results only
3. Use date range filters on charts to filter by time period

### Clearing Data
- "Clear Data" button clears all crawls and legacy data
- Individual crawls can be deleted via `deleteCrawl(crawlId)` (not in UI yet)

## Benefits

1. **No Data Loss**: Each crawl is preserved
2. **Historical Tracking**: Can compare different crawls
3. **Flexible Viewing**: View all data or specific crawls
4. **Time-based Analysis**: Date range filters for trend analysis
5. **Simplified Input**: No need to include dates in CSV
6. **Simplified Logic**: No sentiment analysis complexity
