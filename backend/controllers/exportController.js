const { Key, Language, StringValue } = require('../models');
const fs = require('fs-extra');
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
  
  // Create the directory with parents
  fs.ensureDirSync(dirname);
  console.log(`Created directory: ${dirname}`);
  return true;
};

/**
 * Export all localization data to Flutter format
 */
exports.exportToFlutter = async (req, res) => {
  try {
    console.log('Starting Flutter export...');
    
    // Fetch all keys with their string values
    const keys = await Key.findAll({
      include: [
        {
          model: StringValue,
          include: [Language],
        },
      ],
    });
    console.log(`Fetched ${keys.length} keys from database`);
    
    // Fetch all languages
    const languages = await Language.findAll();
    console.log(`Fetched ${languages.length} languages from database`);
    
    if (!keys.length) {
      return res.status(404).json({ message: 'No keys found to export' });
    }
    
    if (!languages.length) {
      return res.status(404).json({ message: 'No languages found to export' });
    }
    
    // Process the data for export
    console.log('Processing data for export...');
    const { languageMap, supportedLocales, keys: processedKeys } = organizeDataForExport(keys, languages);
    console.log(`Organized data: ${Object.keys(languageMap).length} language maps, ${supportedLocales.length} locales`);
    
    // Create output directory in the system temp directory
    const outputDir = path.join(process.cwd(), 'temp', 'flutter_export', Date.now().toString());
    console.log(`Creating output directory: ${outputDir}`);
    
    const l10nDir = path.join(outputDir, 'lib', 'l10n');
    ensureDirectoryExistence(path.join(l10nDir, 'dummy.txt'));
    console.log(`Created l10n directory: ${l10nDir}`);
    
    // Create language-specific files
    console.log('Creating language-specific files...');
    for (const [langCode, strings] of Object.entries(languageMap)) {
      const language = languages.find(l => l.code === langCode);
      if (!language) {
        console.log(`Skipping language ${langCode} - not found in languages`);
        continue;
      }
      
      console.log(`Generating file for language: ${langCode} (${language.name})`);
      const langFile = generateLanguageFile(langCode, language.name, strings);
      const langFilePath = path.join(l10nDir, `${langCode}_localizations.dart`);
      console.log(`Writing to: ${langFilePath}`);
      
      try {
        fs.writeFileSync(langFilePath, langFile);
        console.log(`Successfully wrote ${langCode} file`);
      } catch (error) {
        console.error(`Error writing ${langCode} file:`, error);
        throw error;
      }
    }
    
    // Create AppLocalizations class
    console.log('Creating AppLocalizations class...');
    try {
      const appLocalizationsFile = generateAppLocalizationsClass(processedKeys, supportedLocales);
      const appLocalizationsPath = path.join(l10nDir, 'app_localizations.dart');
      console.log(`Writing AppLocalizations to: ${appLocalizationsPath}`);
      fs.writeFileSync(appLocalizationsPath, appLocalizationsFile);
      console.log('Successfully wrote AppLocalizations file');
    } catch (error) {
      console.error('Error creating AppLocalizations class:', error);
      throw error;
    }
    
    // Create the gen_l10n.yaml file for Flutter
    console.log('Creating l10n.yaml file...');
    try {
      const yamlContent = `arb-dir: lib/l10n
template-arb-file: app_en.arb
output-localization-file: app_localizations.dart
output-class: AppLocalizations
`;
      const yamlPath = path.join(outputDir, 'l10n.yaml');
      console.log(`Writing l10n.yaml to: ${yamlPath}`);
      fs.writeFileSync(yamlPath, yamlContent);
      console.log('Successfully wrote l10n.yaml file');
    } catch (error) {
      console.error('Error creating l10n.yaml file:', error);
      throw error;
    }
    
    // Create a simple README.md file with instructions
    console.log('Creating README file...');
    try {
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
      const readmePath = path.join(outputDir, 'README.md');
      console.log(`Writing README.md to: ${readmePath}`);
      fs.writeFileSync(readmePath, readmeContent);
      console.log('Successfully wrote README.md file');
    } catch (error) {
      console.error('Error creating README.md file:', error);
      throw error;
    }
    
    // Create a zip file of the output directory
    console.log('Creating ZIP file...');
    const zipPath = `${outputDir}.zip`;
    console.log(`ZIP path: ${zipPath}`);
    
    try {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });
      
      // Listen for errors
      archive.on('error', (err) => {
        console.error('Archiver error:', err);
        throw err;
      });
      
      // Log when the archive is finalized
      archive.on('finish', () => {
        console.log(`Archive finalized. Total bytes: ${archive.pointer()}`);
      });
      
      // Pipe archive data to the file
      archive.pipe(output);
      
      // Append files from output directory
      console.log(`Adding directory to archive: ${outputDir}`);
      archive.directory(outputDir, false);
      
      // Finalize the archive
      console.log('Finalizing archive...');
      await archive.finalize();
      console.log('Archive finalized successfully');
      
      // Send the zip file
      console.log('Sending ZIP file as response...');
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename=flutter_localizations.zip');
      
      const fileStream = fs.createReadStream(zipPath);
      fileStream.pipe(res);
      
      // Clean up after sending the file
      fileStream.on('end', () => {
        console.log('File stream ended, cleaning up...');
        setTimeout(() => {
          try {
            fs.rmSync(outputDir, { recursive: true, force: true });
            console.log(`Removed directory: ${outputDir}`);
            fs.unlinkSync(zipPath);
            console.log(`Removed ZIP file: ${zipPath}`);
          } catch (error) {
            console.error('Error during cleanup:', error);
          }
        }, 1000);
      });
    } catch (error) {
      console.error('Error creating or sending ZIP:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error exporting to Flutter:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ 
      message: 'Error exporting to Flutter', 
      error: error.message,
      stack: error.stack
    });
  }
}; 