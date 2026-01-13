# Sample Data Files

I've created three sample data files that you can use to test the application:

## Files Created

### 1. `sample-queries.csv` (Recommended)
- **Format**: CSV with headers and additional columns
- **Columns**: `query`, `date`, `category`
- **Queries**: 20 sample queries
- **Use case**: Full-featured testing with metadata

### 2. `sample-queries-simple.csv`
- **Format**: Simple CSV with just the query column
- **Columns**: `query` only
- **Queries**: 10 sample queries
- **Use case**: Quick testing, minimal format

### 3. `sample-queries.txt`
- **Format**: Plain text, one query per line
- **Queries**: 15 sample queries
- **Use case**: Simplest format, no headers needed

## How to Use

1. **Start the application**: `npm run dev`
2. **Navigate to**: Prompts & Queries page
3. **Click**: "Select File"
4. **Choose**: One of the sample files
5. **Review**: The number of queries detected
6. **Process**: Click "Process Queries"

## File Format Requirements

### CSV Format
- First row must be headers
- Must include a column named: `query`, `prompt`, or `question`
- Additional columns are optional (date, category, etc.)
- UTF-8 encoding
- Line breaks: LF or CRLF

### Text Format
- One query per line
- No headers needed
- UTF-8 encoding

## Example CSV Structure

```csv
query,date,category
Best project management software,2024-12-13,software
Alternatives to Monday.com,2024-12-12,alternatives
```

## Notes

- All sample queries are related to project management software
- You can modify the queries to match your brand/industry
- The application will automatically detect the query column
- Additional columns (date, category) are preserved but not required

## Customizing for Your Brand

To test with your own brand:

1. Replace queries with ones relevant to your industry
2. Ensure queries would naturally mention your brand when asked to AI
3. Test with various query types (comparisons, alternatives, best-of lists, etc.)

## Troubleshooting

If the file isn't read correctly:
- Check file encoding is UTF-8
- Ensure the query column is named correctly
- Verify there are no empty rows at the top
- Check that commas in queries are properly handled (the parser handles basic cases)
