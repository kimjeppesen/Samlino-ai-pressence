# CORS Fix - Direct Browser Access

## The Solution

Anthropic's API **does support** direct browser requests (including from localhost), but you need to include a special header that was added in August 2024:

```
anthropic-dangerous-direct-browser-access: true
```

## What Changed

I've added this header to:
1. ✅ The main API call in `src/lib/services/aiProviders.ts`
2. ✅ The test button in `src/components/dashboard/ConfigPanel.tsx`

## Why It Works Now

- **Before**: Missing the required header → CORS error
- **After**: Header included → API accepts browser requests

## Security Note

⚠️ **Important**: This header is named "dangerous" because it exposes your API key in client-side code. Anyone who inspects your website can see and potentially use your API key.

**Best Practices:**
- Only use this for internal tools or development
- For production, consider using a backend proxy to keep API keys secure
- If users provide their own API keys, this approach is acceptable

## Testing

1. Go to **Settings** page
2. Enter your Claude API key
3. Click **Test** button - it should now work! ✅
4. Try processing queries - they should work from localhost

## If It Still Doesn't Work

If you still get CORS errors after this fix:
1. Check your Anthropic account settings - some organizations may have CORS disabled
2. Contact Anthropic support to enable CORS for your organization
3. Consider using a backend proxy as an alternative
