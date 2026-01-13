# Netlify Function Timeout Fix

## Problem
OpenAI API calls through the Netlify Function are timing out after 30 seconds when processing multiple queries.

## Root Cause
- Netlify Functions have a default timeout of 10 seconds (free tier)
- Maximum timeout is 26 seconds on free tier
- Processing multiple queries sequentially causes cumulative delays
- OpenAI API calls can take 5-10+ seconds each

## Solutions Applied

### 1. Reduced Function Timeout
- Changed from 25 seconds to 20 seconds in the function code
- This ensures we're well under the Netlify limit

### 2. Increased Delay for ChatGPT
- Added 2 second delay between ChatGPT API calls (instead of 1 second)
- This helps prevent overwhelming the function

### 3. Function Timeout Configuration
**IMPORTANT**: The timeout in `netlify.toml` may not work. You need to set it in the Netlify dashboard:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** > **Functions**
3. Find `openai-proxy` function
4. Set **Timeout** to **26 seconds** (maximum for free tier)

## Recommendations

### For Best Results:

1. **Process queries one at a time** when using ChatGPT:
   - Select queries individually
   - Process them separately
   - This avoids function timeouts

2. **Use smaller batches**:
   - Reduce batch size from 3 to 1 or 2
   - This gives each query more time

3. **Process ChatGPT separately**:
   - Process queries with Claude/Perplexity first
   - Then process the same queries with ChatGPT separately

4. **Upgrade to Netlify Pro** (if needed):
   - Pro tier allows up to 26 seconds timeout
   - Better for processing multiple queries

## Alternative: Direct API Calls (Localhost Only)

If you're testing locally, the code automatically uses direct API calls (bypassing the proxy), which won't have timeout issues.

## Error Handling

The function now returns a clear error message when it times out:
```
Request timeout - the API call took too long. Try processing queries one at a time or reduce the number of queries.
```

This helps identify timeout issues vs other API errors.
