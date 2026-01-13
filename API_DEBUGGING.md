# API Debugging Guide

## Console Logging Added

The application now has comprehensive logging to help debug API issues. When you process queries, check the browser console (F12) for detailed logs.

## What to Look For

### 1. API Key Check
Look for:
```
[Claude API] API key found: sk-ant-xxx...
[Claude API] Using model: claude-3-opus-20240229
```
If you see "API key not configured", the key isn't set correctly.

### 2. API Call Status
Look for:
```
[Claude API] Response status: 200 OK
[Claude API] Response received, content length: 1234
```
- **200 OK**: Success
- **401 Unauthorized**: Invalid API key
- **429 Too Many Requests**: Rate limit exceeded
- **500 Server Error**: API server issue

### 3. Response Content
Look for:
```
[Claude API] Response received, content length: 1234
```
If length is 0, the API returned empty content.

### 4. Brand Detection
Look for:
```
[Brand Detection] Analyzing response (1234 chars) for brand: "Samlino" with aliases: [...]
[Brand Detection] Result: { mentioned: true, position: 1, sentiment: "positive", ... }
```

### 5. Results Saving
Look for:
```
[useQueryProcessor] Processed 4 queries, got 4 results
[useQueryProcessor] Saving results to storage...
[useQueryProcessor] Results saved successfully
```

## Common Issues

### Issue: "API key not configured"
**Solution:**
1. Go to Settings page
2. Enter your Claude API key
3. Click Save Configuration
4. Try processing again

### Issue: "401 Unauthorized"
**Solution:**
- API key is invalid or expired
- Check key format: should start with `sk-ant-`
- Get new key from https://console.anthropic.com/

### Issue: "No results returned"
**Possible causes:**
1. API calls are failing silently
2. Brand name not found in responses
3. Results not being saved

**Check:**
- Console for error messages
- Network tab for failed requests
- localStorage for saved data

### Issue: "Empty content in response"
**Solution:**
- API returned empty response
- Check API quota/limits
- Try a different query

## Step-by-Step Debugging

1. **Open Console** (F12 → Console tab)
2. **Clear Console** (right-click → Clear console)
3. **Process Queries** (upload CSV and click Process)
4. **Watch Logs** - You should see:
   - `[Query Processor] Starting batch processing...`
   - `[Claude API] Starting API call...`
   - `[Claude API] Response status: 200`
   - `[Brand Detection] Result: ...`
   - `[useQueryProcessor] Results saved successfully`

5. **Check for Errors** - Red messages indicate problems

## Manual API Test

Test the API directly in console:
```javascript
// Test Claude API call
const testQuery = "Bilforsikring";
const apiKey = localStorage.getItem('ai-visibility-config');
const config = JSON.parse(apiKey || '{}');
const key = config.api?.anthropic?.apiKey;

if (!key) {
  console.error('No API key found');
} else {
  fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [{ role: 'user', content: testQuery }],
    }),
  })
  .then(r => r.json())
  .then(data => {
    console.log('API Response:', data);
    console.log('Content:', data.content?.[0]?.text);
  })
  .catch(err => console.error('API Error:', err));
}
```

## Network Tab

1. Open DevTools → Network tab
2. Process queries
3. Look for requests to `api.anthropic.com`
4. Check:
   - Status code (should be 200)
   - Response body (should contain text)
   - Request headers (should have x-api-key)

## Still Not Working?

1. Check API key is valid
2. Check network connectivity
3. Check API quota/limits
4. Check console for specific error messages
5. Try processing just 1 query to isolate the issue
