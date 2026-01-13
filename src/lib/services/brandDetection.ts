// Service for detecting brand presence in AI responses

import type { BrandPresenceAnalysis, Sentiment } from '../types';
import { getBrandName, getBrandAliases } from '../config';
import { analyzeResponse } from './responseAnalyzer';

/**
 * Analyze AI response for brand presence
 */
export function analyzeBrandPresence(
  response: string,
  brandName?: string
): BrandPresenceAnalysis {
  const brand = brandName || getBrandName();
  const aliases = getBrandAliases();
  const searchTerms = [brand, ...aliases].filter(Boolean);
  
  console.log(`[Brand Detection] Analyzing response (${response.length} chars) for brand: "${brand}" with aliases:`, aliases);

  // Normalize text for case-insensitive search
  const normalizedResponse = response.toLowerCase();
  const normalizedTerms = searchTerms.map(term => term.toLowerCase());

  // Find all mentions (no sentiment analysis)
  const mentions: Array<{ text: string; position: number }> = [];
  let firstPosition: number | null = null;

  normalizedTerms.forEach((term, termIndex) => {
    // For domain formats (like samlino.dk), don't use word boundaries
    const isDomain = term.includes('.');
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = isDomain 
      ? new RegExp(escapedTerm, 'gi')
      : new RegExp(`\\b${escapedTerm}\\b`, 'gi');
    
    let match;

    while ((match = regex.exec(response)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      
      // Extract context (50 chars before and after)
      const contextStart = Math.max(0, start - 50);
      const contextEnd = Math.min(response.length, end + 50);
      const context = response.substring(contextStart, contextEnd);

      if (firstPosition === null) {
        firstPosition = mentions.length + 1; // 1-indexed position
      }

      mentions.push({
        text: context,
        position: mentions.length + 1,
      });
    }
  });

  // Set default sentiment (neutral) - sentiment analysis removed
  const overallSentiment: Sentiment = 'neutral';

  // Calculate confidence based on number of mentions and context quality
  const confidence = calculateConfidence(mentions.length, response.length);

  // Analyze response for competitors and URLs
  const brandMentioned = mentions.length > 0;
  const responseAnalysis = analyzeResponse(response, brandMentioned);

  const result = {
    mentioned: brandMentioned,
    position: firstPosition,
    sentiment: overallSentiment,
    context: mentions[0]?.text || '',
    confidence,
    mentions,
    competitorMentions: responseAnalysis.competitorMentions,
    urls: responseAnalysis.urls,
  };
  
  console.log(`[Brand Detection] Result:`, {
    mentioned: result.mentioned,
    position: result.position,
    sentiment: result.sentiment,
    mentionsCount: mentions.length,
    confidence: result.confidence,
    competitorMentions: result.competitorMentions,
    urlsCount: result.urls?.length || 0,
  });

  return result;
}

// Sentiment analysis functions removed - always returns neutral

/**
 * Calculate confidence score (0-1)
 */
function calculateConfidence(mentionCount: number, responseLength: number): number {
  // Base confidence on mention count
  let confidence = Math.min(mentionCount * 0.3, 0.9);
  
  // Boost confidence if response is substantial
  if (responseLength > 200) {
    confidence = Math.min(confidence + 0.1, 1.0);
  }
  
  // Ensure minimum confidence if mentioned
  if (mentionCount > 0 && confidence < 0.5) {
    confidence = 0.5;
  }

  return Math.round(confidence * 100) / 100;
}
