/**
 * Utility functions for exporting localization data to JSON format
 */

/**
 * Organizes data into a structure suitable for JSON export
 * @param {Array} keys - The keys with their string values
 * @param {Array} languages - All languages
 * @returns {Object} - Object containing organized data for export
 */
const organizeDataForExport = (keys, languages) => {
  // Create the base structure with languages
  const result = {
    metadata: {
      languages: languages.map(lang => ({
        code: lang.code,
        name: lang.name,
        isDefault: lang.isDefault
      })),
      exportDate: new Date().toISOString(),
      totalKeys: keys.length
    },
    keys: {}
  };
  
  // Add keys and translations
  keys.forEach(key => {
    // Create an entry for this key
    result.keys[key.name] = {
      description: key.description || '',
      translations: {}
    };
    
    // Add existing translations
    key.StringValues.forEach(stringValue => {
      const langCode = stringValue.Language.code;
      result.keys[key.name].translations[langCode] = stringValue.value;
    });
    
    // Add placeholders for missing translations
    languages.forEach(lang => {
      if (!result.keys[key.name].translations[lang.code]) {
        result.keys[key.name].translations[lang.code] = `[${lang.code}] ${key.name}`;
      }
    });
  });
  
  return result;
};

/**
 * Generate JSON data for export
 * @param {Object} data - Organized data from organizeDataForExport
 * @returns {String} - Formatted JSON string
 */
const generateJson = (data) => {
  return JSON.stringify(data, null, 2);
};

module.exports = {
  organizeDataForExport,
  generateJson
}; 