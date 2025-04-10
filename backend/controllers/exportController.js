const { Key, Language, StringValue } = require('../models');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { 
  generateLanguageFile, 
  generateAppLocalizationsClass, 
  organizeDataForExport 
} = require('../utils/flutterExporter');

// Utility function to ensure the directory exists
const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

/**
 * Export all localization data to Flutter format
 */
exports.exportToFlutter = async (req, res) => {
  try {
    // Fetch all keys with their string values
    const keys = await Key.findAll({
      include: [
        {
          model: StringValue,
          include: [Language],
        },
      ],
    });
    
    // Fetch all languages
    const languages = await Language.findAll();
    
    if (!keys.length) {
      return res.status(404).json({ message: 'No keys found to export' });
    }
    
    if (!languages.length) {
      return res.status(404).json({ message: 'No languages found to export' });
    }
    
    // Process the data for export
    const { languageMap, supportedLocales, keys: processedKeys } = organizeDataForExport(keys, languages);
    
    // Create output directory in the system temp directory
    const outputDir = path.join(process.cwd(), 'temp', 'flutter_export', Date.now().toString());
    ensureDirectoryExistence(path.join(outputDir, 'lib', 'l10n'));
    
    // Create language-specific files
    for (const [langCode, strings] of Object.entries(languageMap)) {
      const language = languages.find(l => l.code === langCode);
      if (!language) continue;
      
      const langFile = generateLanguageFile(langCode, language.name, strings);
      fs.writeFileSync(
        path.join(outputDir, 'lib', 'l10n', `${langCode}_localizations.dart`),
        langFile
      );
    }
    
    // Create AppLocalizations class
    const appLocalizationsFile = generateAppLocalizationsClass(processedKeys, supportedLocales);
    fs.writeFileSync(
      path.join(outputDir, 'lib', 'l10n', 'app_localizations.dart'),
      appLocalizationsFile
    );
    
    // Create the gen_l10n.yaml file for Flutter
    const yamlContent = `arb-dir: lib/l10n
template-arb-file: app_en.arb
output-localization-file: app_localizations.dart
output-class: AppLocalizations
`;
    fs.writeFileSync(
      path.join(outputDir, 'l10n.yaml'),
      yamlContent
    );
    
    // Create a simple README.md file with instructions
    const readmeContent = `# Flutter Localizations Export

This package contains the localization files for your Flutter application exported from the Localizer tool.

## How to Use

1. Copy the \`lib/l10n\` directory to your Flutter project's \`lib\` directory.
2. Copy the \`l10n.yaml\` file to the root of your Flutter project.
3. Add the following to your \`pubspec.yaml\`:

\`\`\`yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  intl: ^0.18.0

flutter:
  generate: true
\`\`\`

4. In your \`MaterialApp\`, add:

\`\`\`dart
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:your_app/l10n/app_localizations.dart';

MaterialApp(
  title: 'Localized App',
  localizationsDelegates: AppLocalizations.localizationsDelegates,
  supportedLocales: AppLocalizations.supportedLocales,
  home: MyHomePage(),
);
\`\`\`

5. Access translations in your widgets:

\`\`\`dart
final appTitle = AppLocalizations.of(context)!.app_title;
\`\`\`
`;
    fs.writeFileSync(
      path.join(outputDir, 'README.md'),
      readmeContent
    );
    
    // Create a zip file of the output directory
    const zipPath = `${outputDir}.zip`;
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
    
    // Listen for errors
    archive.on('error', (err) => {
      throw err;
    });
    
    // Pipe archive data to the file
    archive.pipe(output);
    
    // Append files from output directory
    archive.directory(outputDir, false);
    
    // Finalize the archive
    await archive.finalize();
    
    // Send the zip file
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=flutter_localizations.zip');
    
    const fileStream = fs.createReadStream(zipPath);
    fileStream.pipe(res);
    
    // Clean up after sending the file
    fileStream.on('end', () => {
      setTimeout(() => {
        fs.rmSync(outputDir, { recursive: true, force: true });
        fs.unlinkSync(zipPath);
      }, 1000);
    });
  } catch (error) {
    console.error('Error exporting to Flutter:', error);
    return res.status(500).json({ 
      message: 'Error exporting to Flutter', 
      error: error.message 
    });
  }
}; 