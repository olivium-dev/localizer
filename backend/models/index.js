const sequelize = require('../config/database');
const Language = require('./Language');
const Key = require('./Key');
const StringValue = require('./StringValue');

// Set up associations
Key.hasMany(StringValue, { foreignKey: 'keyId', onDelete: 'CASCADE' });
StringValue.belongsTo(Key, { foreignKey: 'keyId' });

Language.hasMany(StringValue, { foreignKey: 'languageId', onDelete: 'CASCADE' });
StringValue.belongsTo(Language, { foreignKey: 'languageId' });

module.exports = {
  sequelize,
  Language,
  Key,
  StringValue,
}; 