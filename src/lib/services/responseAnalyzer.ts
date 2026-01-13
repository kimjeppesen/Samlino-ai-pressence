// Service for analyzing AI responses for competitors and URLs

import { COMPETITORS, type CompetitorConfig } from './competitorTracking';

/**
 * Extract URLs from text
 */
export function extractUrls(text: string): string[] {
  // URL regex pattern - matches http, https, and common domain patterns
  const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;
  const matches = text.match(urlPattern);
  
  if (!matches) return [];
  
  // Clean and normalize URLs
  return matches
    .map(url => {
      // Add https:// if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      // Remove trailing punctuation
      url = url.replace(/[.,;:!?]+$/, '');
      return url;
    })
    .filter((url, index, self) => self.indexOf(url) === index) // Remove duplicates
    .filter(url => {
      // Basic URL validation
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });
}

/**
 * Detect competitor mentions in AI response
 */
export function detectCompetitorsInResponse(response: string): string[] {
  const lowerResponse = response.toLowerCase();
  const mentionedCompetitors: string[] = [];
  
  for (const competitor of COMPETITORS) {
    // Check if any alias is mentioned
    const isMentioned = competitor.aliases.some(alias => {
      const aliasLower = alias.toLowerCase();
      // Use word boundaries for better matching
      const regex = new RegExp(`\\b${aliasLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(response);
    });
    
    if (isMentioned) {
      mentionedCompetitors.push(competitor.name);
    }
  }
  
  return mentionedCompetitors;
}

/**
 * Analyze response for competitors and URLs
 */
export interface ResponseAnalysis {
  competitorMentions: string[];
  urls: string[];
}

export function analyzeResponse(response: string, brandMentioned: boolean): ResponseAnalysis {
  const competitorMentions = detectCompetitorsInResponse(response);
  
  // Only extract URLs if brand is mentioned
  const urls = brandMentioned ? extractUrls(response) : [];
  
  return {
    competitorMentions,
    urls,
  };
}
