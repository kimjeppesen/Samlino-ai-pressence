# OpenAI Model Fix - gpt-4 Error

## Issue
Error: `The model 'gpt-4' does not exist or you do not have access to it`

## Cause
The model name `gpt-4` may not be available or your account may not have access to it. OpenAI has different model variants with different names.

## Fix Applied
Updated default model from `gpt-4` to `gpt-4o` (OpenAI's latest model).

## Available OpenAI Models

### Recommended Models (in order of preference):
1. **`gpt-4o`** - Latest and most capable (default now)
2. **`gpt-4-turbo`** - Fast GPT-4 variant
3. **`gpt-4`** - Original GPT-4 (may require special access)
4. **`gpt-3.5-turbo`** - Fast and affordable (always available)

### Model Access
- **gpt-4o**: Available to most accounts
- **gpt-4-turbo**: Available to most accounts
- **gpt-4**: May require paid account or special access
- **gpt-3.5-turbo**: Always available, free tier compatible

## How to Change Model

### Option 1: Use Default (gpt-4o)
The system now defaults to `gpt-4o`. Just test again - it should work!

### Option 2: Change in Settings
1. Go to **Settings** → **API Keys** tab
2. The model field is not currently visible in the UI
3. You can manually edit localStorage if needed (see below)

### Option 3: Manual Config Edit
If you need a different model, you can edit the config directly:

```javascript
// In browser console (F12)
const config = JSON.parse(localStorage.getItem('ai-visibility-config') || '{}');
config.api.openai.model = 'gpt-4-turbo'; // or 'gpt-3.5-turbo'
localStorage.setItem('ai-visibility-config', JSON.stringify(config));
// Refresh page
```

## Test Again

After the fix:
1. Go to **Settings** → **API Keys**
2. Click **Test** button next to ChatGPT API key
3. Should now work with `gpt-4o` model ✅

## If Still Not Working

If you still get errors, try:
1. **Check your OpenAI account**: Make sure you have API access enabled
2. **Check billing**: Some models require paid account
3. **Try gpt-3.5-turbo**: This model is always available
   - Edit config as shown above
   - Set model to `gpt-3.5-turbo`
4. **Check API key permissions**: Generate a new key if needed

## Model Comparison

| Model | Speed | Cost | Availability |
|-------|-------|------|--------------|
| gpt-4o | Fast | Medium | Most accounts |
| gpt-4-turbo | Fast | Medium | Most accounts |
| gpt-4 | Medium | High | Paid accounts |
| gpt-3.5-turbo | Very Fast | Low | All accounts |

The default `gpt-4o` should work for most users!
