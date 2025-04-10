/**
 * Utility functions for exporting localization data to Flutter/Dart format
 */

/**
 * Generates Dart class code for a specific language
 * @param {String} languageCode - The language code (e.g., 'en', 'fr')
 * @param {Array} localizedStrings - Array of localized strings for this language
 * @returns {String} - Dart class code
 */
const generateLanguageFile = (languageCode, languageName, localizedStrings) => {
  const className = `${languageCode.charAt(0).toUpperCase() + languageCode.slice(1)}Localizations`;
  
  const stringGetters = localizedStrings
    .map(item => {
      // Convert key format (e.g., 'app.title' to 'appTitle')
      const methodName = item.key
        .replace(/\./g, '_')
        .replace(/-/g, '_');
      
      // Escape any quotes in the string
      const escapedValue = item.value.replace(/"/g, '\\"');
      
      return `
  /// ${item.description || ''}
  String get ${methodName} => "${escapedValue}";`;
    })
    .join('');

  return `import 'app_localizations.dart';

/// The translations for ${languageName} (\`${languageCode}\`).
class ${className} extends AppLocalizations {
  ${className}([String locale = '${languageCode}']) : super(locale);
${stringGetters}
}
`;
};

/**
 * Generates the main AppLocalizations class
 * @param {Array} keys - All keys with their descriptions
 * @param {Array} supportedLocales - Array of language codes
 * @returns {String} - Dart abstract class code
 */
const generateAppLocalizationsClass = (keys, supportedLocales) => {
  const abstractGetters = keys
    .map(key => {
      const methodName = key.name
        .replace(/\./g, '_')
        .replace(/-/g, '_');
      
      return `
  /// ${key.description || ''}
  String get ${methodName};`;
    })
    .join('');
  
  const localeMapEntries = supportedLocales
    .map(locale => {
      const className = `${locale.charAt(0).toUpperCase() + locale.slice(1)}Localizations`;
      return `    '${locale}': ${className}.new,`;
    })
    .join('\n');

  const importStatements = supportedLocales
    .map(locale => `import '${locale}_localizations.dart';`)
    .join('\n');

  return `import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart';

${importStatements}

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
abstract class AppLocalizations {
  AppLocalizations(String locale) : localeName = locale.toString();

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();

  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates = <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
  ];

  static const List<Locale> supportedLocales = [
    ${supportedLocales.map(locale => `Locale('${locale}')`).join(',\n    ')}
  ];

  /// A map of supported locales to delegate factories
  static final Map<String, AppLocalizations Function(String)> _localizationFactories = {
${localeMapEntries}
  };
  
  /// Creates a new instance from the specified locale.
  factory AppLocalizations.fromLocale(String locale) {
    final String canonicalLocale = Intl.canonicalizedLocale(locale);
    final factoryFunc = _localizationFactories[canonicalLocale] ??
      _localizationFactories[canonicalLocale.split('_')[0]] ??
      _localizationFactories.values.first;
      
    return factoryFunc(locale);
  }${abstractGetters}
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(
      AppLocalizations.fromLocale(locale.toString())
    );
  }

  @override
  bool isSupported(Locale locale) => AppLocalizations.supportedLocales
    .map((e) => e.languageCode)
    .contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
`;
};

/**
 * Organizes data into a structure suitable for Flutter export
 * @param {Array} keys - The keys with their string values
 * @param {Array} languages - All languages
 * @returns {Object} - Object containing organized data for export
 */
const organizeDataForExport = (keys, languages) => {
  // Map to hold localized strings by language code
  const languageMap = {};
  
  // Initialize map for each language
  languages.forEach(lang => {
    languageMap[lang.code] = [];
  });
  
  // Populate the map with localized strings
  keys.forEach(key => {
    // For each string value in this key
    key.StringValues.forEach(stringValue => {
      const langCode = stringValue.Language.code;
      
      if (languageMap[langCode]) {
        languageMap[langCode].push({
          key: key.name,
          value: stringValue.value,
          description: key.description || ''
        });
      }
    });
    
    // Check for missing translations and add placeholder
    languages.forEach(lang => {
      const hasTranslation = key.StringValues.some(sv => 
        sv.Language.code === lang.code
      );
      
      if (!hasTranslation) {
        languageMap[lang.code].push({
          key: key.name,
          value: `[${lang.code}] ${key.name}`, // Placeholder for missing translation
          description: key.description || ''
        });
      }
    });
  });
  
  return {
    languageMap,
    supportedLocales: languages.map(lang => lang.code),
    keys: keys.map(key => ({
      name: key.name,
      description: key.description || ''
    }))
  };
};

module.exports = {
  generateLanguageFile,
  generateAppLocalizationsClass,
  organizeDataForExport
}; 