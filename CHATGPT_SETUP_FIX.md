# ChatGPT API Key Setup Fix

## Issue
After adding ChatGPT API key, the system only scanned Claude and didn't include ChatGPT.

## Root Cause
1. `callChatGPT()` wasn't reloading config like `callClaude()` does
2. Platform detection might use cached config
3. Missing logging to debug platform detection

## Fixes Applied

### 1. Updated `callChatGPT()` to Reload Config
- Now reloads config before checking API key (same as Claude)
- Added detailed logging for debugging
- Better error messages

### 2. Updated Platform Detection
- `getAvailablePlatforms()` already reloads config
- Added better logging to show which platforms are detected

### 3. Updated Query Uploader
- Now checks for ANY API key (not just Claude)
- Shows which API keys are found/missing
- Better error messages

## How to Use

### Step 1: Save Your ChatGPT API Key
1. Go to **Settings** page
2. Click **API Keys** tab
3. Enter your ChatGPT API key in the "OpenAI API Key (ChatGPT)" field
4. **IMPORTANT**: Click **"Save Configuration"** button
5. You should see "✓ Saved" confirmation

### Step 2: Verify It's Saved
Open browser console (F12) and run:
```javascript
const config = JSON.parse(localStorage.getItem('ai-visibility-config') || '{}');
console.log('ChatGPT API Key:', config.api?.openai?.apiKey ? 'Found' : 'Missing');
```

### Step 3: Process Queries
1. Go to **Prompts & Queries** page
2. Upload your CSV file
3. Click **"Process Queries"**
4. Check console logs - you should see:
   ```
   [Platform Detection] OpenAI: Found
   [Platform Detection] Available platforms: ['Claude', 'ChatGPT']
   ```

### Step 4: Verify Both Platforms Are Used
In console, you should see logs like:
```
[Query Processor] Processing query "..." on Claude
[Claude API] Starting API call...
[Query Processor] Processing query "..." on ChatGPT
[ChatGPT API] Starting API call...
```

## Troubleshooting

### If ChatGPT Still Not Detected:

1. **Check Config is Saved**:
   - Make sure you clicked "Save Configuration" after entering the key
   - Check console for: `[ConfigPanel] Configuration saved: { hasOpenAI: true }`

2. **Reload Page**:
   - After saving, refresh the page to ensure config is loaded

3. **Check Console Logs**:
   - Look for `[Platform Detection] OpenAI: Found` or `Missing`
   - If "Missing", the key wasn't saved properly

4. **Manual Check**:
   ```javascript
   // In browser console
   const config = JSON.parse(localStorage.getItem('ai-visibility-config') || '{}');
   console.log('Full config:', config);
   console.log('OpenAI key:', config.api?.openai?.apiKey?.substring(0, 20) + '...');
   ```

5. **Re-enter Key**:
   - Sometimes the key might not save properly
   - Delete and re-enter the key
   - Click "Save Configuration" again

## Expected Behavior

After saving ChatGPT API key and processing queries:
- ✅ Both Claude AND ChatGPT should process queries
- ✅ Results should show entries for both platforms
- ✅ Platform cards should show metrics for both
- ✅ Charts should include data from both platforms

## API Key Format

ChatGPT API keys start with `sk-proj-` (newer format) or `sk-` (older format).

Your key: `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`

This looks correct! Make sure it's saved in Settings.

## Next Steps

1. **Save the key** in Settings (if not already done)
2. **Refresh the page** to reload config
3. **Process queries** and check console logs
4. **Verify** both platforms appear in results

The system should now detect and use ChatGPT along with Claude!
