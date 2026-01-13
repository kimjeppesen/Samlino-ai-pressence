# Model Update - Claude API

## Issue
The model `claude-3-opus-20240229` has been **retired** by Anthropic and is no longer available.

## Solution
Updated to use the current model: `claude-3-5-sonnet-20241022`

## What Changed
1. ✅ Default model in `src/lib/services/aiProviders.ts`
2. ✅ Default model in `src/lib/config.ts`
3. ✅ Test button model in `src/components/dashboard/ConfigPanel.tsx`
4. ✅ Config initialization model

## Next Steps
1. **Clear old config** (if you have the old model saved):
   - Go to Settings
   - The model will automatically update to the new one
   - Or clear localStorage and re-enter your API key

2. **Test the API key**:
   - Go to Settings → API Keys tab
   - Click "Test" button
   - Should now work with the new model ✅

## Alternative Models
If you want to use a different model, you can:
- `claude-3-5-sonnet-20241022` (current default - recommended)
- `claude-3-5-haiku-20241022` (faster, cheaper)
- `claude-opus-4-1-20250805` (newest, most powerful)

Update the model in Settings if needed.
