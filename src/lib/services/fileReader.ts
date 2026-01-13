// Service for reading queries from data files (CSV/Excel)

export interface FileReaderResult {
  queries: Array<{ query: string; [key: string]: any }>;
  headers: string[];
  error?: string;
}

/**
 * Read queries from a CSV file
 */
export async function readCSVFile(file: File): Promise<FileReaderResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          reject(new Error('CSV file is empty'));
          return;
        }

        // Parse headers
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        
        // Find query column (case-insensitive search)
        const queryColumnIndex = headers.findIndex(
          h => h.toLowerCase().includes('query') || 
               h.toLowerCase().includes('prompt') ||
               h.toLowerCase().includes('question')
        );

        if (queryColumnIndex === -1) {
          reject(new Error('No query column found. Please ensure your CSV has a column named "query", "prompt", or "question"'));
          return;
        }

        // Parse data rows (no date parsing - just query text)
        const queries = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const row: any = { id: `query-${index + 1}` };
          
          // Only store query column, ignore date columns
          headers.forEach((header, i) => {
            const headerLower = header.toLowerCase();
            // Skip date-related columns
            if (!headerLower.includes('date') && !headerLower.includes('time')) {
              row[header] = values[i] || '';
            }
          });

          return {
            query: values[queryColumnIndex] || '',
            ...row,
          };
        }).filter(row => row.query.trim() !== '');

        resolve({
          queries,
          headers,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Read queries from an Excel file (requires xlsx library)
 */
export async function readExcelFile(file: File): Promise<FileReaderResult> {
  // This would require the 'xlsx' library
  // For now, we'll show an error message
  throw new Error('Excel file support requires the xlsx library. Please convert to CSV or install xlsx package.');
}

/**
 * Read queries from a text file (one query per line)
 */
export async function readTextFile(file: File): Promise<FileReaderResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const queries = text
          .split('\n')
          .map((line, index) => line.trim())
          .filter(line => line !== '')
          .map((query, index) => ({
            id: `query-${index + 1}`,
            query,
          }));

        resolve({
          queries,
          headers: ['query'],
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Auto-detect file type and read accordingly
 */
export async function readQueryFile(file: File): Promise<FileReaderResult> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.csv')) {
    return readCSVFile(file);
  } else if (fileName.endsWith('.txt')) {
    return readTextFile(file);
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return readExcelFile(file);
  } else {
    throw new Error(`Unsupported file type: ${file.name}. Please use CSV, TXT, or Excel files.`);
  }
}
