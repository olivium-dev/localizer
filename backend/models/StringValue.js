const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StringValue = sequelize.define('StringValue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  keyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Keys',
      key: 'id',
    },
  },
  languageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Languages',
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

module.exports = StringValue; 