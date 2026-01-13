// Service for storing and managing queries with categories and intents

import type { Query } from '../types';

export interface StoredQuery extends Query {
  category?: string;
  intent?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueryCategory {
  id: string;
  name: string;
  createdAt: string;
}

export interface QueryIntent {
  id: string;
  name: string;
  createdAt: string;
}

const STORAGE_KEY_QUERIES = 'ai-visibility-stored-queries';
const STORAGE_KEY_CATEGORIES = 'ai-visibility-query-categories';
const STORAGE_KEY_INTENTS = 'ai-visibility-query-intents';

/**
 * Generate unique ID
 */
function generateId(): string {
  return `query-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Save queries to storage
 */
export function saveQueries(queries: StoredQuery[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_QUERIES, JSON.stringify(queries));
    console.log(`[Query Storage] Saved ${queries.length} queries`);
    window.dispatchEvent(new Event('queriesUpdated'));
  } catch (error) {
    console.error('[Query Storage] Failed to save queries:', error);
    throw error;
  }
}

/**
 * Load queries from storage
 */
export function loadQueries(): StoredQuery[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_QUERIES);
    if (stored) {
      const queries = JSON.parse(stored);
      console.log(`[Query Storage] Loaded ${queries.length} queries`);
      return queries;
    }
  } catch (error) {
    console.error('[Query Storage] Failed to load queries:', error);
  }
  return [];
}

/**
 * Add a new query
 */
export function addQuery(query: Omit<StoredQuery, 'id' | 'createdAt' | 'updatedAt'>): StoredQuery {
  const queries = loadQueries();
  const newQuery: StoredQuery = {
    ...query,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  queries.push(newQuery);
  saveQueries(queries);
  return newQuery;
}

/**
 * Update an existing query
 */
export function updateQuery(queryId: string, updates: Partial<StoredQuery>): StoredQuery | null {
  const queries = loadQueries();
  const index = queries.findIndex(q => q.id === queryId);
  if (index === -1) return null;
  
  queries[index] = {
    ...queries[index],
    ...updates,
    id: queryId, // Ensure ID doesn't change
    updatedAt: new Date().toISOString(),
  };
  saveQueries(queries);
  return queries[index];
}

/**
 * Delete a query
 */
export function deleteQuery(queryId: string): boolean {
  const queries = loadQueries();
  const filtered = queries.filter(q => q.id !== queryId);
  if (filtered.length === queries.length) return false;
  saveQueries(filtered);
  return true;
}

/**
 * Delete multiple queries
 */
export function deleteQueries(queryIds: string[]): number {
  const queries = loadQueries();
  const filtered = queries.filter(q => !queryIds.includes(q.id));
  const deletedCount = queries.length - filtered.length;
  if (deletedCount > 0) {
    saveQueries(filtered);
  }
  return deletedCount;
}

/**
 * Get query by ID
 */
export function getQueryById(queryId: string): StoredQuery | null {
  const queries = loadQueries();
  return queries.find(q => q.id === queryId) || null;
}

/**
 * Get queries by category
 */
export function getQueriesByCategory(category: string): StoredQuery[] {
  const queries = loadQueries();
  return queries.filter(q => q.category === category);
}

/**
 * Get queries by intent
 */
export function getQueriesByIntent(intent: string): StoredQuery[] {
  const queries = loadQueries();
  return queries.filter(q => q.intent === intent);
}

// ========== Categories ==========

/**
 * Save categories
 */
function saveCategories(categories: QueryCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    window.dispatchEvent(new Event('categoriesUpdated'));
  } catch (error) {
    console.error('[Query Storage] Failed to save categories:', error);
  }
}

/**
 * Load categories
 */
export function loadCategories(): QueryCategory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('[Query Storage] Failed to load categories:', error);
  }
  // Return default categories if none exist
  const defaults: QueryCategory[] = [
    { id: 'default', name: 'General', createdAt: new Date().toISOString() },
  ];
  saveCategories(defaults);
  return defaults;
}

/**
 * Add a new category
 */
export function addCategory(name: string): QueryCategory {
  const categories = loadCategories();
  // Check if category already exists
  const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing;
  
  const newCategory: QueryCategory = {
    id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
}

/**
 * Delete a category (and remove it from all queries)
 */
export function deleteCategory(categoryId: string): boolean {
  const categories = loadCategories();
  const filtered = categories.filter(c => c.id !== categoryId);
  if (filtered.length === categories.length) return false;
  
  saveCategories(filtered);
  
  // Remove category from all queries
  const queries = loadQueries();
  queries.forEach(q => {
    if (q.category === categoryId) {
      q.category = undefined;
    }
  });
  saveQueries(queries);
  
  return true;
}

// ========== Intents ==========

/**
 * Save intents
 */
function saveIntents(intents: QueryIntent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_INTENTS, JSON.stringify(intents));
    window.dispatchEvent(new Event('intentsUpdated'));
  } catch (error) {
    console.error('[Query Storage] Failed to save intents:', error);
  }
}

/**
 * Load intents
 */
export function loadIntents(): QueryIntent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_INTENTS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('[Query Storage] Failed to load intents:', error);
  }
  // Return default intents if none exist
  const defaults: QueryIntent[] = [
    { id: 'default', name: 'Informational', createdAt: new Date().toISOString() },
  ];
  saveIntents(defaults);
  return defaults;
}

/**
 * Add a new intent
 */
export function addIntent(name: string): QueryIntent {
  const intents = loadIntents();
  // Check if intent already exists
  const existing = intents.find(i => i.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing;
  
  const newIntent: QueryIntent = {
    id: `intent-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };
  intents.push(newIntent);
  saveIntents(intents);
  return newIntent;
}

/**
 * Delete an intent (and remove it from all queries)
 */
export function deleteIntent(intentId: string): boolean {
  const intents = loadIntents();
  const filtered = intents.filter(i => i.id !== intentId);
  if (filtered.length === intents.length) return false;
  
  saveIntents(filtered);
  
  // Remove intent from all queries
  const queries = loadQueries();
  queries.forEach(q => {
    if (q.intent === intentId) {
      q.intent = undefined;
    }
  });
  saveQueries(queries);
  
  return true;
}

/**
 * Clear all stored queries, categories, and intents
 */
export function clearAllQueryData(): void {
  localStorage.removeItem(STORAGE_KEY_QUERIES);
  localStorage.removeItem(STORAGE_KEY_CATEGORIES);
  localStorage.removeItem(STORAGE_KEY_INTENTS);
  window.dispatchEvent(new Event('queriesUpdated'));
  window.dispatchEvent(new Event('categoriesUpdated'));
  window.dispatchEvent(new Event('intentsUpdated'));
}
