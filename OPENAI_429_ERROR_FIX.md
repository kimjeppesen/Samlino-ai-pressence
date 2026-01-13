# OpenAI 429 Error - Quota/Rate Limit Issue

## Error Message
`❌ API key test failed (429): You exceeded your current quota, please check your plan and billing details.`

## Understanding 429 Errors

A 429 status code from OpenAI can mean:
1. **Rate Limit Exceeded**: Too many requests too quickly
2. **Quota Exceeded**: Account spending limit reached
3. **Account Restrictions**: Account needs verification or upgrade

## Even If You Have Credits

If you see this error but have $5 available, it could be:

### 1. Rate Limiting (Most Likely)
- OpenAI has **per-minute** and **per-day** rate limits
- Even with credits, you can hit rate limits
- **Solution**: Wait 1-2 minutes and try again

### 2. Account Verification Needed
- New accounts may need phone verification
- Some features require payment method on file
- **Solution**: Check https://platform.openai.com/account

### 3. API Key Permissions
- API key might not have access to certain models
- Key might be restricted
- **Solution**: Generate a new API key

### 4. Billing Issue
- Credits might not be activated
- Payment method might need verification
- **Solution**: Check https://platform.openai.com/account/billing

## Quick Fixes

### Fix 1: Wait and Retry (Rate Limiting)
1. Wait **1-2 minutes**
2. Click **Test** button again
3. Should work if it was rate limiting

### Fix 2: Check Your Account
1. Go to https://platform.openai.com/account/billing
2. Verify:
   - Credits are available
   - Payment method is on file (if required)
   - Account is verified
3. Check usage limits

### Fix 3: Generate New API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Delete old key (optional)
4. Enter new key in Settings
5. Save and test

### Fix 4: Use Different Model
If `gpt-4o` has restrictions, try `gpt-3.5-turbo`:

```javascript
// In browser console (F12)
const config = JSON.parse(localStorage.getItem('ai-visibility-config') || '{}');
config.api.openai.model = 'gpt-3.5-turbo';
localStorage.setItem('ai-visibility-config', JSON.stringify(config));
window.location.reload();
```

## Rate Limits by Model

| Model | Requests/Minute | Tokens/Minute |
|-------|----------------|---------------|
| gpt-4o | Varies by tier | Varies by tier |
| gpt-4-turbo | Varies by tier | Varies by tier |
| gpt-3.5-turbo | Higher limits | Higher limits |

**Free tier** has very low limits, **paid tier** has higher limits.

## What the Test Does

The test sends a simple "Hello" query with `max_tokens: 10`, which should cost almost nothing. If you're getting 429 on this, it's likely:
- Rate limiting (too many recent requests)
- Account restrictions
- Not actual quota issue

## During Query Processing

**Good news**: Even if the test fails with 429, query processing might still work because:
- We add delays between requests (1 second)
- We process in small batches
- Rate limits reset over time

## Recommended Actions

1. **Wait 2-3 minutes** and test again
2. **Check billing page**: https://platform.openai.com/account/billing
3. **Verify account**: Make sure account is fully set up
4. **Try processing queries**: The test might fail but processing could work
5. **Contact OpenAI support**: If issue persists

## Error Messages Updated

The system now provides more helpful error messages:
- **429 with "quota"**: Directs you to billing page
- **429 with "rate limit"**: Suggests waiting
- **401**: Invalid key message
- **404**: Model not found message

Try waiting a few minutes and testing again - rate limits reset quickly!
