// AI Provider services for different platforms

import type { Platform, BrandPresenceAnalysis } from '../types';
import { getConfig, loadConfigFromStorage } from '../config';

export interface AIResponse {
  content: string;
  model?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
  };
}

/**
 * Call OpenAI ChatGPT API
 */
export async function callChatGPT(query: string): Promise<AIResponse> {
  console.log('[ChatGPT API] Starting API call for query:', query.substring(0, 50) + '...');
  
  // Ensure config is loaded
  loadConfigFromStorage();
  
  const config = getConfig();
  console.log('[ChatGPT API] Config loaded, checking for API key...');
  console.log('[ChatGPT API] Config API keys:', {
    hasOpenAI: !!config.api.openai?.apiKey,
    hasEnvVar: !!import.meta.env.VITE_OPENAI_API_KEY,
  });
  
  // Try config first, then environment variable
  const apiKey = config.api.openai?.apiKey || import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    const error = 'OpenAI API key not configured. Please go to Settings page and enter your ChatGPT API key, or set VITE_OPENAI_API_KEY environment variable.';
    console.error('[ChatGPT API]', error);
    console.error('[ChatGPT API] Current config:', JSON.stringify(config, null, 2));
    throw new Error(error);
  }

  console.log('[ChatGPT API] API key found:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
  
  const model = config.api.openai?.model || 'gpt-5-nano';
  const language = config.language?.code || 'da';
  const country = config.language?.country || 'DK';
  console.log('[ChatGPT API] Using model:', model);
  console.log('[ChatGPT API] Language:', language, 'Country:', country);

  try {
    console.log('[ChatGPT API] Making fetch request...');
    // Add language context for Danish (Denmark)
    const systemMessage = `You are responding to queries in Danish (Denmark). Please provide responses in Danish when appropriate, and consider the Danish market context.`;
    
    // Detect if we're on Netlify and use proxy function to avoid CORS issues
    const isNetlify = window.location.hostname.includes('netlify.app');
    const apiUrl = isNetlify 
      ? '/.netlify/functions/openai-proxy'
      : 'https://api.openai.com/v1/chat/completions';
    
    const requestBody = {
      model,
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: query,
        },
      ],
      temperature: 0.7,
    };
    
    // If using proxy, include API key in request body
    const body = isNetlify
      ? JSON.stringify({ ...requestBody, apiKey })
      : JSON.stringify(requestBody);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Only add Authorization header if not using proxy
    if (!isNetlify) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      mode: 'cors',
      headers,
      body,
    }).catch((fetchError) => {
      console.error('[ChatGPT API] Fetch error details:', fetchError);
      // If it's a CORS error, provide helpful message
      if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('CORS') || fetchError.message.includes('NetworkError')) {
        throw new Error('CORS/Network Error: Unable to reach OpenAI API. This may be a temporary network issue or CORS restriction. Please try again or check your network connection.');
      }
      throw fetchError;
    });

    console.log('[ChatGPT API] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ChatGPT API] Error response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }
      
      const errorMsg = errorData.error?.message || errorText || 'Failed to get response';
      let userFriendlyMsg = errorMsg;
      
      // Provide helpful messages for common errors
      if (response.status === 429) {
        if (errorMsg.includes('quota')) {
          userFriendlyMsg = `Quota exceeded. Check your OpenAI billing at https://platform.openai.com/account/billing. If you have credits available, this might be a temporary rate limit - try again in a few minutes.`;
        } else if (errorMsg.includes('rate limit')) {
          userFriendlyMsg = `Rate limit exceeded. Wait a few seconds and try again.`;
        } else {
          userFriendlyMsg = `Rate limit/quota issue. Check billing at https://platform.openai.com/account/billing or wait a few minutes.`;
        }
      } else if (response.status === 401) {
        userFriendlyMsg = `Invalid API key. Check that the key is correct and hasn't been revoked.`;
      } else if (response.status === 404) {
        userFriendlyMsg = `Model not found. The model "${model}" may not be available. Try a different model.`;
      }
      
      throw new Error(`OpenAI API error (${response.status}): ${userFriendlyMsg}`);
    }

    const data = await response.json();
    console.log('[ChatGPT API] Response received, content length:', data.choices[0]?.message?.content?.length || 0);
    
    const content = data.choices[0]?.message?.content || '';
    if (!content) {
      console.warn('[ChatGPT API] Empty content in response:', data);
    }
    
    return {
      content,
      model: data.model,
      usage: data.usage,
    };
  } catch (error) {
    console.error('[ChatGPT API] Fetch error:', error);
    throw error;
  }
}

/**
 * Call Anthropic Claude API
 */
export async function callClaude(query: string): Promise<AIResponse> {
  console.log('[Claude API] Starting API call for query:', query.substring(0, 50) + '...');
  
  // Ensure config is loaded
  loadConfigFromStorage();
  
  const config = getConfig();
  console.log('[Claude API] Config loaded, checking for API key...');
  console.log('[Claude API] Config API keys:', {
    hasAnthropic: !!config.api.anthropic?.apiKey,
    hasEnvVar: !!import.meta.env.VITE_ANTHROPIC_API_KEY,
  });
  
  // Try config first, then environment variable
  const apiKey = config.api.anthropic?.apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    const error = 'Anthropic API key not configured. Please go to Settings page and enter your Claude API key, or set VITE_ANTHROPIC_API_KEY environment variable.';
    console.error('[Claude API]', error);
    console.error('[Claude API] Current config:', JSON.stringify(config, null, 2));
    throw new Error(error);
  }

  console.log('[Claude API] API key found:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
  
  const model = config.api.anthropic?.model || 'claude-3-5-haiku-20241022';
  const language = config.language?.code || 'da';
  const country = config.language?.country || 'DK';
  console.log('[Claude API] Using model:', model);
  console.log('[Claude API] Language:', language, 'Country:', country);

  try {
    console.log('[Claude API] Making fetch request...');
    // Add language context for Danish (Denmark)
    const systemMessage = `You are responding to queries in Danish (Denmark). Please provide responses in Danish when appropriate, and consider the Danish market context.`;
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      mode: 'cors', // Explicitly set CORS mode
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true', // Required for browser CORS access
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: systemMessage,
        messages: [
          {
            role: 'user',
            content: query,
          },
        ],
      }),
    }).catch((fetchError) => {
      console.error('[Claude API] Fetch error details:', fetchError);
      // If it's a CORS error, provide helpful message
      if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('CORS')) {
        throw new Error('CORS error: Anthropic API may not support direct browser requests. Consider using a backend proxy or check if the API endpoint supports CORS.');
      }
      throw fetchError;
    });

    console.log('[Claude API] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Claude API] Error response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }
      throw new Error(`Anthropic API error (${response.status}): ${errorData.error?.message || errorText || 'Failed to get response'}`);
    }

    const data = await response.json();
    console.log('[Claude API] Response received, content length:', data.content?.[0]?.text?.length || 0);
    
    const content = data.content[0]?.text || '';
    if (!content) {
      console.warn('[Claude API] Empty content in response:', data);
    }
    
    return {
      content,
      model: data.model,
      usage: data.usage,
    };
  } catch (error) {
    console.error('[Claude API] Fetch error:', error);
    throw error;
  }
}

/**
 * Call Perplexity API
 */
export async function callPerplexity(query: string): Promise<AIResponse> {
  const config = getConfig();
  // Try config first, then environment variable
  const apiKey = config.api.perplexity?.apiKey || import.meta.env.VITE_PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    throw new Error('Perplexity API key not configured. Please set it in Settings or VITE_PERPLEXITY_API_KEY environment variable.');
  }

  const model = config.api.perplexity?.model || 'pplx-70b-online';

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Perplexity API error: ${error.error?.message || 'Failed to get response'}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content || '',
    model: data.model,
    usage: data.usage,
  };
}

/**
 * Call Google Gemini API
 */
export async function callGemini(query: string): Promise<AIResponse> {
  const config = getConfig();
  // Try config first, then environment variable
  const apiKey = config.api.google?.apiKey || import.meta.env.VITE_GOOGLE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google API key not configured. Please set it in Settings or VITE_GOOGLE_API_KEY environment variable.');
  }

  const model = config.api.google?.model || 'gemini-pro';

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: query,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Google API error: ${error.error?.message || 'Failed to get response'}`);
  }

  const data = await response.json();
  return {
    content: data.candidates[0]?.content?.parts[0]?.text || '',
    model: data.model,
  };
}

/**
 * Call the appropriate AI provider based on platform
 */
export async function callAIProvider(platform: Platform, query: string): Promise<AIResponse> {
  switch (platform) {
    case 'ChatGPT':
      return callChatGPT(query);
    case 'Claude':
      return callClaude(query);
    case 'Perplexity':
      return callPerplexity(query);
    case 'Gemini':
      return callGemini(query);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
