// /home/caleb/Desktop/PROJECTS/KHC/src/utils/csvParser.js

/**
 * Parses raw CSV content into array of JSON objects based on header row
 * @param {string} csvText - Raw CSV file string
 * @returns {Array<Object>} Array of parsed row objects
 */
export const parseCSV = (csvText) => {
  if (!csvText || typeof csvText !== 'string') return [];

  const lines = csvText
    .split(/\r\n|\n|\r/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] !== undefined ? values[idx].trim() : '';
    });
    results.push(row);
  }

  return results;
};

/**
 * Helper to split a single CSV line accounting for quoted fields
 * @param {string} line 
 * @returns {Array<string>}
 */

const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
};

/**
 * Generate CSV string from array of objects
 * @param {Array<Object>} data 
 * @param {Array<string>} headers 
 * @returns {string} CSV formatted string
 */
export const generateCSV = (data, headers) => {
  if (!data || data.length === 0) return '';

  const headerKeys = headers || Object.keys(data[0]);
  const csvRows = [headerKeys.join(',')];

  data.forEach(row => {
    const values = headerKeys.map(key => {
      const val = row[key] !== undefined && row[key] !== null ? String(row[key]) : '';
      const escaped = val.replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
};
