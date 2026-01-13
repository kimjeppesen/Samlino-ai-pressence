# Clear Cache & Fix Stuck Settings

## Quick Fix

### Option 1: Use the Clear Cache Button (Easiest)
1. Go to **Settings** page
2. Scroll to bottom
3. Click **"Clear Cache & Reload Config"** button
4. Re-enter your API keys if needed
5. Click **"Save Configuration"**

### Option 2: Manual Browser Console (If button doesn't work)
1. Open browser console (F12)
2. Run these commands:

```javascript
// Clear config cache
localStorage.removeItem('ai-visibility-config');
console.log('Config cache cleared');

// Reload page
window.location.reload();
```

### Option 3: Hard Refresh (Clear Browser Cache)
1. **Mac**: `Cmd + Shift + R`
2. **Windows/Linux**: `Ctrl + Shift + R`
3. Or: `Ctrl + F5`

This clears the browser's JavaScript cache and forces a fresh load.

### Option 4: Clear All Application Data
1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Find **Local Storage** → `http://localhost:5173` (or your URL)
4. Right-click → **Clear**
5. Refresh page

## Why Settings Get Stuck

Settings can get stuck because:
1. **localStorage cache**: Old config stored in browser
2. **JavaScript cache**: Browser cached old code
3. **Config not reloading**: System using cached config object

## After Clearing Cache

1. **Re-enter API keys** in Settings
2. **Click "Save Configuration"**
3. **Test each API key** using Test buttons
4. **Process queries** - should now use correct models

## Verify It's Fixed

After clearing cache, check console:
```javascript
const config = JSON.parse(localStorage.getItem('ai-visibility-config') || '{}');
console.log('Current config:', {
  openaiModel: config.api?.openai?.model,
  hasOpenAI: !!config.api?.openai?.apiKey,
});
```

Should show:
- `openaiModel: "gpt-4o"` (not "gpt-4")
- `hasOpenAI: true` (if you entered the key)

## If Still Stuck

1. **Close all browser tabs** with the app
2. **Clear browser cache** completely
3. **Restart browser**
4. **Open app fresh**
5. **Re-enter all settings**

The "Clear Cache & Reload Config" button should handle most cases automatically!
