const { Language } = require('../models');

// Get all languages
exports.getAllLanguages = async (req, res) => {
  try {
    const languages = await Language.findAll();
    return res.status(200).json(languages);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching languages', error: error.message });
  }
};

// Get a single language by ID
exports.getLanguageById = async (req, res) => {
  try {
    const language = await Language.findByPk(req.params.id);
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }
    return res.status(200).json(language);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching language', error: error.message });
  }
};

// Create a new language
exports.createLanguage = async (req, res) => {
  try {
    const { code, name, isDefault } = req.body;
    
    // Validate required fields
    if (!code || !name) {
      return res.status(400).json({ message: 'Code and name are required' });
    }
    
    // If this is set as default, unset any existing default language
    if (isDefault) {
      await Language.update(
        { isDefault: false },
        { where: { isDefault: true } }
      );
    }
    
    const language = await Language.create({
      code,
      name,
      isDefault: isDefault || false,
    });
    
    return res.status(201).json(language);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating language', error: error.message });
  }
};

// Update a language
exports.updateLanguage = async (req, res) => {
  try {
    const { code, name, isDefault } = req.body;
    const language = await Language.findByPk(req.params.id);
    
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }
    
    // If this is being set as default, unset any existing default
    if (isDefault && !language.isDefault) {
      await Language.update(
        { isDefault: false },
        { where: { isDefault: true } }
      );
    }
    
    const updatedData = {
      code: code || language.code,
      name: name || language.name,
      isDefault: isDefault !== undefined ? isDefault : language.isDefault,
    };
    
    await language.update(updatedData);
    
    // Refresh the instance to get the updated values
    await language.reload();
    
    return res.status(200).json(language);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating language', error: error.message });
  }
};

// Delete a language
exports.deleteLanguage = async (req, res) => {
  try {
    const language = await Language.findByPk(req.params.id);
    
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }
    
    // Prevent deletion of default language
    if (language.isDefault) {
      return res.status(400).json({ message: 'Cannot delete the default language' });
    }
    
    await language.destroy();
    return res.status(200).json({ message: 'Language deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting language', error: error.message });
  }
}; 