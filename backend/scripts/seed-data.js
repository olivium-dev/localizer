const { sequelize, Language, Key, StringValue } = require('../models');

async function seedData() {
  try {
    console.log('Starting seed operation...');
    
    // Create or find 3 languages
    console.log('Setting up languages...');
    const [english] = await Language.findOrCreate({
      where: { code: 'en' },
      defaults: {
        name: 'English',
        isDefault: true
      }
    });
    
    const [french] = await Language.findOrCreate({
      where: { code: 'fr' },
      defaults: {
        name: 'French',
        isDefault: false
      }
    });
    
    const [spanish] = await Language.findOrCreate({
      where: { code: 'es' },
      defaults: {
        name: 'Spanish',
        isDefault: false
      }
    });
    
    const languages = [english, french, spanish];
    console.log(`Languages ready: ${languages.map(l => l.code).join(', ')}`);
    
    // Create 10 keys with translations
    const keyData = [
      {
        name: 'app.title',
        description: 'Application title shown in header',
        translations: {
          en: 'Localizer App',
          fr: 'Application de Localisation',
          es: 'Aplicación de Localización'
        }
      },
      {
        name: 'app.welcome',
        description: 'Welcome message on homepage',
        translations: {
          en: 'Welcome to Localizer!',
          fr: 'Bienvenue sur Localizer !',
          es: '¡Bienvenido a Localizer!'
        }
      },
      {
        name: 'nav.keys',
        description: 'Navigation label for keys page',
        translations: {
          en: 'Localization Keys',
          fr: 'Clés de Localisation',
          es: 'Claves de Localización'
        }
      },
      {
        name: 'nav.languages',
        description: 'Navigation label for languages page',
        translations: {
          en: 'Languages',
          fr: 'Langues',
          es: 'Idiomas'
        }
      },
      {
        name: 'action.add',
        description: 'Label for add buttons',
        translations: {
          en: 'Add',
          fr: 'Ajouter',
          es: 'Añadir'
        }
      },
      {
        name: 'action.edit',
        description: 'Label for edit buttons',
        translations: {
          en: 'Edit',
          fr: 'Modifier',
          es: 'Editar'
        }
      },
      {
        name: 'action.delete',
        description: 'Label for delete buttons',
        translations: {
          en: 'Delete',
          fr: 'Supprimer',
          es: 'Eliminar'
        }
      },
      {
        name: 'action.save',
        description: 'Label for save button',
        translations: {
          en: 'Save',
          fr: 'Enregistrer',
          es: 'Guardar'
        }
      },
      {
        name: 'action.cancel',
        description: 'Label for cancel button',
        translations: {
          en: 'Cancel',
          fr: 'Annuler',
          es: 'Cancelar'
        }
      },
      {
        name: 'common.search',
        description: 'Label for search field',
        translations: {
          en: 'Search...',
          fr: 'Rechercher...',
          es: 'Buscar...'
        }
      }
    ];
    
    console.log('Creating keys and translations...');
    
    const languageMap = {
      en: english.id,
      fr: french.id,
      es: spanish.id
    };
    
    // Create each key and its translations
    let createdCount = 0;
    for (const keyItem of keyData) {
      // Check if key already exists
      const [key, created] = await Key.findOrCreate({
        where: { name: keyItem.name },
        defaults: {
          description: keyItem.description
        }
      });
      
      if (created) {
        createdCount++;
        
        // Create translations for each language
        const stringValues = [];
        for (const [langCode, translation] of Object.entries(keyItem.translations)) {
          stringValues.push({
            keyId: key.id,
            languageId: languageMap[langCode],
            value: translation
          });
        }
        
        await StringValue.bulkCreate(stringValues);
      }
    }
    
    console.log(`Created ${createdCount} new keys with translations in 3 languages`);
    console.log(`${keyData.length - createdCount} keys already existed and were skipped`);
    console.log('Seed operation completed successfully!');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Call the seed function
seedData(); 