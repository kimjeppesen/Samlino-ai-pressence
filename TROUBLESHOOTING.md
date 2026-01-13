# Troubleshooting - Data Not Updating

## Issue: Old Data Still Showing After Upload

If you're seeing old data after uploading and processing queries, follow these steps:

### Step 1: Clear Old Data
1. Go to the **Prompts & Queries** page
2. Click the **"Clear Data"** button in the Upload Queries card
3. Confirm the action
4. The page will refresh automatically

### Step 2: Upload and Process
1. Upload your `sample-queries.csv` file
2. Click **"Process Queries"**
3. Wait for processing to complete
4. Data should automatically refresh

### Step 3: Check Browser Console
- Open browser DevTools (F12)
- Check the Console tab for any errors
- Look for messages about API calls or data storage

### Step 4: Verify API Key
- Go to **Settings** page
- Ensure your Claude API key is configured
- The system will only process through platforms with API keys

### Step 5: Manual Refresh
If data still doesn't update:
1. Hard refresh the page: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Or clear browser cache and reload

## Common Issues

### Issue: "No queries processed"
- **Cause**: API key not configured or invalid
- **Solution**: Check Settings page and verify API key

### Issue: "Processing but no results"
- **Cause**: API calls failing silently
- **Solution**: Check browser console for error messages

### Issue: "Old data persists"
- **Cause**: localStorage cache
- **Solution**: Use "Clear Data" button or manually clear localStorage:
  ```javascript
  localStorage.removeItem('ai-visibility-query-results');
  localStorage.removeItem('ai-visibility-processed-queries');
  ```

## Data Storage

All query results are stored in browser localStorage:
- Key: `ai-visibility-query-results`
- Location: Browser DevTools → Application → Local Storage

To manually inspect:
1. Open DevTools (F12)
2. Go to Application tab
3. Click Local Storage
4. Find your domain
5. Look for `ai-visibility-query-results`

## Platform Configuration

The system only processes queries through platforms with configured API keys:
- If only Claude API key is set, only Claude will be used
- If multiple keys are set, all will be used
- Default: Claude only (if no keys configured)
