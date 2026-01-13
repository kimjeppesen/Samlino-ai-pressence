# CORS Fix for Netlify - OpenAI API Proxy

## Problem
OpenAI API calls work fine on localhost but fail on Netlify with CORS errors. This is because OpenAI's API has CORS restrictions that allow localhost but may block production domains.

## Solution
Created a Netlify Function to proxy OpenAI API calls. This avoids CORS issues completely because:
1. The function runs server-side on Netlify
2. Server-to-server API calls don't have CORS restrictions
3. The function handles CORS headers for the frontend

## What Was Changed

### 1. Created Netlify Function
- **File**: `netlify/functions/openai-proxy.js`
- Proxies OpenAI API requests
- Handles CORS preflight requests
- Forwards API key securely

### 2. Updated API Calls
- **File**: `src/lib/services/aiProviders.ts`
- Detects if running on Netlify (checks for `netlify.app` in hostname)
- Uses proxy function when on Netlify: `/.netlify/functions/openai-proxy`
- Uses direct API call when on localhost

### 3. Updated Test Function
- **File**: `src/components/dashboard/ConfigPanel.tsx`
- Same detection logic for test button
- Uses proxy on Netlify, direct call on localhost

### 4. Updated Netlify Configuration
- **File**: `netlify.toml`
- Added redirect rule to exclude Netlify Functions from SPA routing

## How It Works

### On Localhost
```
Frontend → Direct API call → OpenAI API
```

### On Netlify
```
Frontend → Netlify Function → OpenAI API → Netlify Function → Frontend
```

The Netlify Function:
1. Receives request from frontend (includes API key in body)
2. Makes server-side request to OpenAI API
3. Returns response with proper CORS headers

## Testing

1. **On Localhost**: Should work as before (direct API calls)
2. **On Netlify**: Will automatically use the proxy function

The code automatically detects the environment and uses the appropriate method.

## Deployment

After pushing to GitHub, Netlify will:
1. Build the frontend (`npm run build`)
2. Deploy the Netlify Function automatically
3. Function will be available at: `/.netlify/functions/openai-proxy`

## Security Note

⚠️ **API Key Security**: The API key is still sent from the frontend to the proxy function. This is acceptable because:
- Users provide their own API keys
- The function doesn't store keys
- Keys are only used for the specific request

For production apps where you manage API keys, consider:
- Storing keys in Netlify environment variables
- Using the function to inject keys server-side
- Implementing rate limiting

## Troubleshooting

### Function Not Found (404)
- Check that `netlify/functions/openai-proxy.js` exists
- Verify Netlify detected the function (check Functions tab in Netlify dashboard)
- Redeploy if needed

### Still Getting CORS Errors
- Check browser console for actual error
- Verify the function is being called (check Network tab)
- Check Netlify Function logs in dashboard

### API Key Errors
- Verify API key is being sent in request body when using proxy
- Check function logs for detailed error messages

## Next Steps

1. **Commit and Push**:
   ```bash
   git add .
   git commit -m "Add Netlify Function proxy for OpenAI API to fix CORS"
   git push origin main
   ```

2. **Wait for Netlify Deployment**: Netlify will automatically deploy

3. **Test**: Try the OpenAI API test button on your Netlify site

The CORS error should now be resolved! ✅
