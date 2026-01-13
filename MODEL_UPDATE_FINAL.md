# Final Model Update - Claude API

## Issue
Multiple model versions have been deprecated:
- ❌ `claude-3-opus-20240229` - Retired
- ❌ `claude-3-5-sonnet-20241022` - Deprecated and retired

## Solution
Updated to the current recommended model: **`claude-sonnet-4-20250514`**

## What Changed
1. ✅ Default model in `src/lib/services/aiProviders.ts`
2. ✅ Default model in `src/lib/config.ts`  
3. ✅ Test button model in `src/components/dashboard/ConfigPanel.tsx`
4. ✅ All model references updated

## Next Steps
1. **Clear old config** (if you have the old model saved):
   - Open browser console (F12)
   - Run: `localStorage.removeItem('ai-visibility-config')`
   - Refresh the page
   - Re-enter your API key in Settings

2. **Test the API key**:
   - Go to Settings → API Keys tab
   - Click "Test" button
   - Should now work with `claude-sonnet-4-20250514` ✅

## Alternative Models (if needed)
- `claude-sonnet-4-20250514` (current default - recommended)
- `claude-haiku-4-20250514` (faster, cheaper)
- `claude-opus-4-20250514` (most powerful)

You can change the model in Settings if needed.
