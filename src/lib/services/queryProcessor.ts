// Service for processing queries through AI providers

import type { Query, QueryResult, ProcessedQuery, Platform } from '../types';
import { callAIProvider } from './aiProviders';
import { analyzeBrandPresence } from './brandDetection';
import { getConfig, loadConfigFromStorage } from '../config';

export interface ProcessingOptions {
  platforms?: Platform[];
  batchSize?: number;
  onProgress?: (processed: number, total: number) => void;
}

// Only use platforms that have API keys configured
function getAvailablePlatforms(): Platform[] {
  // Force reload config from storage to get latest
  loadConfigFromStorage();
  
  const config = getConfig();
  const platforms: Platform[] = [];
  
  const anthropicKey = config.api.anthropic?.apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY;
  const openaiKey = config.api.openai?.apiKey || import.meta.env.VITE_OPENAI_API_KEY;
  const perplexityKey = config.api.perplexity?.apiKey || import.meta.env.VITE_PERPLEXITY_API_KEY;
  const googleKey = config.api.google?.apiKey || import.meta.env.VITE_GOOGLE_API_KEY;
  
  console.log('[Platform Detection] Checking API keys...');
  console.log('[Platform Detection] Config from storage:', {
    hasAnthropic: !!config.api.anthropic?.apiKey,
    hasOpenAI: !!config.api.openai?.apiKey,
    openaiModel: config.api.openai?.model,
  });
  console.log('[Platform Detection] Anthropic:', anthropicKey ? 'Found' : 'Missing');
  console.log('[Platform Detection] OpenAI:', openaiKey ? 'Found' : 'Missing', openaiKey ? `(model: ${config.api.openai?.model || 'gpt-4o'})` : '');
  console.log('[Platform Detection] Perplexity:', perplexityKey ? 'Found' : 'Missing');
  console.log('[Platform Detection] Google:', googleKey ? 'Found' : 'Missing');
  
  if (anthropicKey) {
    platforms.push('Claude');
  }
  if (openaiKey) {
    platforms.push('ChatGPT');
  }
  if (perplexityKey) {
    platforms.push('Perplexity');
  }
  if (googleKey) {
    platforms.push('Gemini');
  }
  
  if (platforms.length === 0) {
    console.warn('[Platform Detection] No API keys found! Please configure at least one API key in Settings.');
    // Don't default to Claude if no key - this will cause errors
    return [];
  }
  
  console.log('[Platform Detection] Available platforms:', platforms);
  return platforms;
}

/**
 * Process a single query through all platforms
 */
export async function processQuery(
  query: Query,
  options: ProcessingOptions = {}
): Promise<ProcessedQuery> {
  const availablePlatforms = getAvailablePlatforms();
  const platforms = options.platforms || availablePlatforms;
  const results: QueryResult[] = [];
  const processedAt = new Date().toISOString();

  if (platforms.length === 0) {
    const error = 'No API keys configured. Please go to Settings and configure at least one API key (Claude, ChatGPT, Perplexity, or Gemini).';
    console.error('[Query Processor]', error);
    return {
      ...query,
      results: [],
      processedAt,
      status: 'error',
      error,
    };
  }

  try {
    // Process query through each platform
    for (const platform of platforms) {
      try {
        console.log(`[Query Processor] Processing query "${query.query.substring(0, 50)}..." on ${platform}`);
        
        // Call AI provider
        const aiResponse = await callAIProvider(platform, query.query);
        console.log(`[Query Processor] Got response from ${platform}, length: ${aiResponse.content.length}`);
        
        if (!aiResponse.content || aiResponse.content.trim().length === 0) {
          console.warn(`[Query Processor] Empty response from ${platform} for query: ${query.query}`);
          continue;
        }
        
        // Analyze brand presence
        const analysis = analyzeBrandPresence(aiResponse.content);
        console.log(`[Query Processor] Brand analysis: mentioned=${analysis.mentioned}, position=${analysis.position}, sentiment=${analysis.sentiment}`);

        // Create result (date is set to crawl date, not from query)
        const result: QueryResult = {
          id: `${query.id}-${platform.toLowerCase()}-${Date.now()}`,
          query: query.query,
          platform,
          mentioned: analysis.mentioned,
          position: analysis.position,
          sentiment: 'neutral', // Sentiment removed - always neutral
          date: new Date().toISOString().split('T')[0], // Use current date, not from CSV
          context: analysis.context,
          fullResponse: aiResponse.content,
          confidence: analysis.confidence,
          competitorMentions: analysis.competitorMentions,
          urls: analysis.urls,
        };

        results.push(result);
        console.log(`[Query Processor] Created result for ${platform}, total results: ${results.length}`);

        // Add delay between API calls to avoid rate limits
        // Longer delay for OpenAI to avoid Netlify Function timeouts
        // Increased delay to give function time to recover between calls
        const delay = platform === 'ChatGPT' ? 3000 : 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[Query Processor] Error processing query "${query.query}" on ${platform}:`, errorMessage);
        console.error('[Query Processor] Full error:', error);
        // Continue with other platforms even if one fails
      }
    }
    
    console.log(`[Query Processor] Completed processing query "${query.query}", got ${results.length} results`);

    return {
      ...query,
      results,
      processedAt,
      status: 'completed',
    };
  } catch (error) {
    return {
      ...query,
      results,
      processedAt,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process multiple queries sequentially (one at a time)
 * This avoids Netlify Function timeouts by processing each query individually
 */
export async function processQueries(
  queries: Query[],
  options: ProcessingOptions = {}
): Promise<ProcessedQuery[]> {
  console.log(`[Query Processor] Starting sequential processing of ${queries.length} queries`);
  
  const availablePlatforms = getAvailablePlatforms();
  console.log(`[Query Processor] Available platforms:`, availablePlatforms);
  
  const onProgress = options.onProgress;
  const processed: ProcessedQuery[] = [];
  const total = queries.length;

  // Process queries one by one (sequentially) to avoid timeout issues
  // Each query is processed completely before moving to the next
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`[Query Processor] Processing query ${i + 1}/${total}: "${query.query.substring(0, 50)}..."`);
    
    try {
      // Process this single query through all platforms
      const result = await processQuery(query, options);
      processed.push(result);
      
      const resultCount = result.results.length;
      console.log(`[Query Processor] Completed query ${i + 1}/${total}, got ${resultCount} results`);
      
      // Update progress after each query
      if (onProgress) {
        onProgress(processed.length, total);
      }
      
      // Small delay between queries to avoid rate limits
      // Longer delay for ChatGPT to avoid Netlify Function timeouts
      // Increased delay to give function time to recover
      if (i < queries.length - 1) {
        const hasChatGPT = availablePlatforms.includes('ChatGPT');
        const delay = hasChatGPT ? 5000 : 2000; // 5 seconds for ChatGPT, 2 seconds for others
        console.log(`[Query Processor] Waiting ${delay}ms before next query...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Query Processor] Failed to process query ${i + 1}/${total}:`, errorMessage);
      
      // Add error result to maintain count
      processed.push({
        ...query,
        results: [],
        processedAt: new Date().toISOString(),
        status: 'error',
        error: errorMessage,
      });
      
      if (onProgress) {
        onProgress(processed.length, total);
      }
      
      // Continue with next query even if this one failed
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const finalTotalResults = processed.reduce((sum, p) => sum + p.results.length, 0);
  console.log(`[Query Processor] All queries completed. Total queries processed: ${processed.length}, Total results: ${finalTotalResults}`);
  
  return processed;
}

/**
 * Process a single query through a specific platform
 */
export async function processQueryForPlatform(
  query: Query,
  platform: Platform
): Promise<QueryResult> {
  try {
    const aiResponse = await callAIProvider(platform, query.query);
    const analysis = analyzeBrandPresence(aiResponse.content);

    return {
      id: `${query.id}-${platform.toLowerCase()}-${Date.now()}`,
      query: query.query,
      platform,
      mentioned: analysis.mentioned,
      position: analysis.position,
      sentiment: 'neutral', // Sentiment removed - always neutral
      date: new Date().toISOString().split('T')[0], // Use current date, not from CSV
      context: analysis.context,
      fullResponse: aiResponse.content,
      confidence: analysis.confidence,
      competitorMentions: analysis.competitorMentions,
      urls: analysis.urls,
    };
  } catch (error) {
    throw new Error(`Failed to process query for ${platform}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
