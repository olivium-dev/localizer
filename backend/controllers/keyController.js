const { Key, StringValue, Language, sequelize } = require('../models');

// Get all keys with their string values
exports.getAllKeys = async (req, res) => {
  try {
    const keys = await Key.findAll({
      include: [
        {
          model: StringValue,
          include: [Language],
        },
      ],
    });
    
    return res.status(200).json(keys);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching keys', error: error.message });
  }
};

// Get a single key by ID
exports.getKeyById = async (req, res) => {
  try {
    const key = await Key.findByPk(req.params.id, {
      include: [
        {
          model: StringValue,
          include: [Language],
        },
      ],
    });
    
    if (!key) {
      return res.status(404).json({ message: 'Key not found' });
    }
    
    return res.status(200).json(key);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching key', error: error.message });
  }
};

// Create a new key with string values
exports.createKey = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { name, description, stringValues } = req.body;
    
    // Validate required fields
    if (!name) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Key name is required' });
    }
    
    // Validate that there's at least one string value for the default language
    const defaultLanguage = await Language.findOne({ 
      where: { isDefault: true },
      transaction,
    });
    
    if (!defaultLanguage) {
      await transaction.rollback();
      return res.status(400).json({ message: 'No default language found. Please set up a default language first.' });
    }
    
    // Check if we have a value for the default language
    const hasDefaultValue = stringValues && 
      stringValues.some(sv => sv.languageId === defaultLanguage.id && sv.value);
    
    if (!hasDefaultValue) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `A value for the default language (${defaultLanguage.name}) is required` 
      });
    }
    
    // Create the key
    const key = await Key.create({
      name,
      description,
    }, { transaction });
    
    // Create string values
    if (stringValues && stringValues.length > 0) {
      const stringValuePromises = stringValues.map(sv => 
        StringValue.create({
          value: sv.value,
          keyId: key.id,
          languageId: sv.languageId,
        }, { transaction })
      );
      
      await Promise.all(stringValuePromises);
    }
    
    await transaction.commit();
    
    // Fetch the key with its string values to return
    const createdKey = await Key.findByPk(key.id, {
      include: [
        {
          model: StringValue,
          include: [Language],
        },
      ],
    });
    
    return res.status(201).json(createdKey);
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: 'Error creating key', error: error.message });
  }
};

// Update a key and its string values
exports.updateKey = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { name, description, stringValues } = req.body;
    const keyId = req.params.id;
    
    // Check if key exists
    const key = await Key.findByPk(keyId, { transaction });
    if (!key) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Key not found' });
    }
    
    // Update key properties
    if (name || description !== undefined) {
      await key.update({
        name: name || key.name,
        description: description !== undefined ? description : key.description,
      }, { transaction });
    }
    
    // Update or create string values
    if (stringValues && stringValues.length > 0) {
      // Process each string value
      for (const sv of stringValues) {
        if (!sv.languageId) {
          continue;
        }
        
        // Check if this string value already exists
        const existingValue = await StringValue.findOne({
          where: { keyId, languageId: sv.languageId },
          transaction,
        });
        
        if (existingValue) {
          // Update existing value
          await existingValue.update({ value: sv.value }, { transaction });
        } else if (sv.value) {
          // Create new value
          await StringValue.create({
            value: sv.value,
            keyId,
            languageId: sv.languageId,
          }, { transaction });
        }
      }
    }
    
    await transaction.commit();
    
    // Get updated key with string values
    const updatedKey = await Key.findByPk(keyId, {
      include: [
        {
          model: StringValue,
          include: [Language],
        },
      ],
    });
    
    return res.status(200).json(updatedKey);
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: 'Error updating key', error: error.message });
  }
};

// Delete a key and all its string values
exports.deleteKey = async (req, res) => {
  try {
    const key = await Key.findByPk(req.params.id);
    
    if (!key) {
      return res.status(404).json({ message: 'Key not found' });
    }
    
    await key.destroy(); // This will also delete associated StringValues due to CASCADE
    
    return res.status(200).json({ message: 'Key deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting key', error: error.message });
  }
}; 