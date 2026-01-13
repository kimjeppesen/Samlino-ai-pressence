# Query Management System

## Overview

The application now includes a comprehensive query management system that allows you to store, organize, and manage queries with categories and intents, instead of one-time file uploads.

## Key Features

### 1. Persistent Query Storage
- Queries are stored in localStorage and persist across sessions
- Each query has a unique ID and timestamps (createdAt, updatedAt)
- No need to re-upload queries - they're always available

### 2. Category Management
- Assign queries to categories for better organization
- Create new categories on-the-fly using the "+" option in the dropdown
- Categories are stored separately and can be reused across queries
- Default category: "General"

### 3. Intent Management
- Assign intents to queries (e.g., "Informational", "Purchase", "Comparison")
- Create new intents on-the-fly using the "+" option in the dropdown
- Intents are stored separately and can be reused across queries
- Default intent: "Informational"

### 4. Query Operations
- **Add**: Create new queries manually
- **Edit**: Update query text, category, or intent
- **Delete**: Remove individual queries or bulk delete selected queries
- **Select**: Select individual queries or select all
- **Run**: Process selected queries or all queries

## Usage

### Adding Queries

1. Click **"Add Query"** button
2. Enter your query text in the dialog
3. Click **"Add Query"** to save

### Managing Categories

1. In the Category column, click the dropdown
2. Select an existing category or click **"Create new category"**
3. If creating new:
   - Enter the category name
   - Press Enter or click Save
   - The new category is automatically assigned to the query

### Managing Intents

1. In the Intent column, click the dropdown
2. Select an existing intent or click **"Create new intent"**
3. If creating new:
   - Enter the intent name
   - Press Enter or click Save
   - The new intent is automatically assigned to the query

### Running Queries

1. **Select queries** (optional):
   - Check individual queries
   - Or click "Select all" to select all queries
2. Click **"Run"** button:
   - **"Run Selected (N)"** - if queries are selected
   - **"Run All"** - if no queries are selected
3. The system will process queries through configured AI platforms
4. Results are saved as a new crawl

### Bulk Operations

- **Select All**: Check the checkbox in the header to select all queries
- **Delete Selected**: Click "Delete Selected (N)" to remove multiple queries at once

## Storage Structure

### Queries
- **Storage Key**: `ai-visibility-stored-queries`
- **Format**: Array of `StoredQuery` objects
- Each query includes:
  - `id`: Unique identifier
  - `query`: Query text
  - `category`: Category ID (optional)
  - `intent`: Intent ID (optional)
  - `createdAt`: ISO timestamp
  - `updatedAt`: ISO timestamp

### Categories
- **Storage Key**: `ai-visibility-query-categories`
- **Format**: Array of `QueryCategory` objects
- Each category includes:
  - `id`: Unique identifier
  - `name`: Category name
  - `createdAt`: ISO timestamp

### Intents
- **Storage Key**: `ai-visibility-query-intents`
- **Format**: Array of `QueryIntent` objects
- Each intent includes:
  - `id`: Unique identifier
  - `name`: Intent name
  - `createdAt`: ISO timestamp

## API Functions

### Query Management
- `loadQueries()`: Load all stored queries
- `saveQueries(queries)`: Save queries array
- `addQuery(query)`: Add a new query
- `updateQuery(queryId, updates)`: Update a query
- `deleteQuery(queryId)`: Delete a query
- `deleteQueries(queryIds)`: Delete multiple queries
- `getQueryById(queryId)`: Get a specific query
- `getQueriesByCategory(category)`: Filter by category
- `getQueriesByIntent(intent)`: Filter by intent

### Category Management
- `loadCategories()`: Load all categories
- `addCategory(name)`: Create a new category
- `deleteCategory(categoryId)`: Delete a category

### Intent Management
- `loadIntents()`: Load all intents
- `addIntent(name)`: Create a new intent
- `deleteIntent(intentId)`: Delete an intent

### Utility
- `clearAllQueryData()`: Clear all queries, categories, and intents

## Migration from File Upload

The old file upload system (`QueryUploader`) is still available but the new `QueryManager` is the primary interface. To migrate:

1. Use QueryManager to manually add your queries
2. Or keep using file upload - queries from files can be added to storage (future enhancement)

## Benefits

1. **No Re-uploading**: Queries persist across sessions
2. **Better Organization**: Categories and intents help organize queries
3. **Flexible Workflow**: Add queries anytime, run when ready
4. **Bulk Operations**: Select and process multiple queries at once
5. **Easy Management**: Edit, delete, and organize queries in one place

## UI Components

- **QueryManager**: Main component for managing queries
- Located in: `src/components/dashboard/QueryManager.tsx`
- Used in: `src/pages/Queries.tsx`

## Future Enhancements

- Import queries from CSV into storage
- Export queries to CSV
- Filter queries by category/intent
- Search queries
- Duplicate queries
- Query templates
