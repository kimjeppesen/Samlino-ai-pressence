# CORS Proxy Solution

## The Problem
Anthropic's API may not allow direct browser requests due to CORS restrictions. The "Failed to fetch" error indicates this.

## Quick Solution: Add CORS Proxy

We can use a CORS proxy service for development. Here's how to add it:

### Option 1: Use Public CORS Proxy (Development Only)
⚠️ **Warning**: Only for development. Never use in production.

### Option 2: Create Simple Backend Proxy (Recommended)
Create a simple Express server that proxies requests to Anthropic API.

## Implementation

I can create a simple Node.js proxy server that:
1. Receives requests from the frontend
2. Adds the API key server-side
3. Makes the request to Anthropic
4. Returns the response

This avoids CORS issues completely.

Would you like me to:
1. Create a simple backend proxy server?
2. Or try a different approach to fix the CORS issue?

## For Now: Test if Processing Works

Even if the test button fails due to CORS, the actual processing might work. Try:
1. Save your API key in Settings
2. Process queries
3. Check Network tab to see if API calls succeed
4. Check console for detailed logs

The test button failure might be a false negative - the actual API calls during processing might work fine.
