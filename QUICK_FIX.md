# Quick Fix Guide - "No results returned from API"

## Immediate Steps

### 1. Verify API Key is Set
1. Go to **Settings** page
2. Click **API Keys** tab
3. Check if **Anthropic API Key (Claude)** field has a value
4. If empty, enter your Claude API key (starts with `sk-ant-`)
5. Click **Save Configuration**
6. Click **Test** button next to the API key to verify it works

### 2. Check Console Logs
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Clear console (right-click → Clear console)
4. Try processing queries again
5. Look for these specific messages:

**If you see:**
- `[Platform Detection] Anthropic: Missing` → API key not configured
- `[Claude API] API key not configured` → API key not found
- `[Claude API] Response status: 401` → Invalid API key
- `[Claude API] Response status: 429` → Rate limit exceeded
- `[Claude API] Response status: 500` → API server error

### 3. Manual API Key Check
Run this in browser console to check if key is saved:
```javascript
const config = JSON.parse(localStorage.getItem('ai-visibility-config') || '{}');
console.log('API Key configured:', !!config.api?.anthropic?.apiKey);
console.log('API Key (first 10 chars):', config.api?.anthropic?.apiKey?.substring(0, 10));
```

### 4. Test API Key Directly
Run this in browser console to test the API:
```javascript
const config = JSON.parse(localStorage.getItem('ai-visibility-config') || '{}');
const apiKey = config.api?.anthropic?.apiKey;

if (!apiKey) {
  console.error('No API key found in localStorage');
} else {
  fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Hello' }],
    }),
  })
  .then(r => r.json())
  .then(data => {
    if (data.content) {
      console.log('✅ API key works! Response:', data.content[0]?.text);
    } else {
      console.error('❌ API error:', data);
    }
  })
  .catch(err => console.error('❌ Request failed:', err));
}
```

## Common Solutions

### Solution 1: API Key Not Saved
- Go to Settings
- Enter API key
- Click **Save Configuration**
- Check console for confirmation message

### Solution 2: API Key Invalid
- Verify key format: should start with `sk-ant-`
- Get new key from https://console.anthropic.com/
- Make sure key has proper permissions

### Solution 3: Network/CORS Issues
- Check Network tab in DevTools
- Look for failed requests to `api.anthropic.com`
- Check for CORS errors

### Solution 4: Config Not Loading
- Clear browser cache
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Check localStorage: DevTools → Application → Local Storage

## What the Logs Should Show

When working correctly, you should see:
```
[Platform Detection] Anthropic: Found
[Query Processor] Available platforms: ['Claude']
[Claude API] Starting API call...
[Claude API] API key found: sk-ant-xxx...
[Claude API] Response status: 200 OK
[Claude API] Response received, content length: 1234
[Brand Detection] Result: { mentioned: true, ... }
[useQueryProcessor] Results saved successfully
```

If you see different messages, share them and I can help debug further.
