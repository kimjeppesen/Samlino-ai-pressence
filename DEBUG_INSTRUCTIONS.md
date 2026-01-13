# Debug Instructions - Verify API Processing

## Step 1: Clear All Data
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Run this command:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

## Step 2: Check API Key
1. Go to **Settings** page
2. Verify Claude API key is entered
3. Click **Save Configuration**

## Step 3: Upload and Process
1. Go to **Prompts & Queries** page
2. Upload `sample-queries.csv`
3. Click **Process Queries**
4. **Watch the browser console** for:
   - "Processing X queries..."
   - "Saving X query results to localStorage"
   - "Results saved successfully"
   - Any error messages

## Step 4: Verify Data Storage
1. In DevTools, go to **Application** tab
2. Click **Local Storage** → Your domain
3. Look for key: `ai-visibility-query-results`
4. Click it to see the stored data
5. You should see JSON with query results

## Step 5: Check Console Logs
The console should show:
- `Loaded X query results from localStorage` (on page load)
- `Processed X queries, got Y results` (after processing)
- `Saving Y results to storage...` (when saving)
- `Results saved successfully` (confirmation)

## Common Issues

### No Results After Processing
- Check console for API errors
- Verify API key is valid
- Check network tab for failed requests

### Data Not Appearing
- Check localStorage has data (Application tab)
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Check console for "queryDataUpdated" events

### Old Data Persists
- Clear localStorage manually:
  ```javascript
  localStorage.removeItem('ai-visibility-query-results');
  localStorage.removeItem('ai-visibility-processed-queries');
  location.reload();
  ```

## Expected Behavior

When you process queries:
1. Console shows processing progress
2. Results are saved to localStorage
3. All pages automatically refresh
4. Empty states disappear
5. Real data appears in tables and charts

If this doesn't happen, check the console for error messages.
