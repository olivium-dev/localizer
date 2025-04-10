/**
 * Utility functions for exporting localization data to CSV format
 */

/**
 * Escape special characters in CSV values
 * @param {String} value - The string value to escape
 * @returns {String} - Escaped string
 */
const escapeCSV = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  
  value = String(value);
  
  // If the value contains comma, double quote, or newline, wrap it in double quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    // Replace any double quotes with two double quotes
    value = value.replace(/"/g, '""');
    // Wrap in double quotes
    value = `"${value}"`;
  }
  
  return value;
};

/**
 * Organizes data into a structure suitable for CSV export
 * @param {Array} keys - The keys with their string values
 * @param {Array} languages - All languages
 * @returns {Object} - Object containing organized data for export
 */
const organizeDataForExport = (keys, languages) => {
  // Create an array for translations
  const rows = [];
  
  // Add the header row with key, description, and language codes
  const headerRow = ['Key', 'Description'];
  languages.forEach(lang => {
    headerRow.push(`${lang.name} (${lang.code})`);
  });
  rows.push(headerRow);
  
  // Add rows for each key
  keys.forEach(key => {
    const row = [key.name, key.description || ''];
    
    // Create a map of translations by language code
    const translationMap = {};
    key.StringValues.forEach(stringValue => {
      translationMap[stringValue.Language.code] = stringValue.value;
    });
    
    // Add translations for each language (or placeholder)
    languages.forEach(lang => {
      const value = translationMap[lang.code] || `[${lang.code}] ${key.name}`;
      row.push(value);
    });
    
    rows.push(row);
  });
  
  return rows;
};

/**
 * Generate CSV data for export
 * @param {Array} rows - Organized data from organizeDataForExport
 * @returns {String} - Formatted CSV string
 */
const generateCsv = (rows) => {
  return rows.map(row => 
    row.map(value => escapeCSV(value)).join(',')
  ).join('\n');
};

module.exports = {
  organizeDataForExport,
  generateCsv
}; 