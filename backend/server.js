require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const languageRoutes = require('./routes/languageRoutes');
const keyRoutes = require('./routes/keyRoutes');
const exportRoutes = require('./routes/exportRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/languages', languageRoutes);
app.use('/api/keys', keyRoutes);
app.use('/api/export', exportRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Localizer API is running');
});

// Test reset endpoint (only in development and test)
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/test/reset', async (req, res) => {
    try {
      await sequelize.sync({ force: true });
      
      // Create default language
      const { Language } = require('./models');
      await Language.create({
        code: 'en',
        name: 'English',
        isDefault: true,
      });
      
      res.status(200).json({ message: 'Database reset successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error resetting database', error: error.message });
    }
  });
}

// Database sync and server start
const startServer = async () => {
  try {
    // Sync database models
    await sequelize.sync();
    console.log('Database synced successfully');
    
    // Create default language if none exists
    const { Language } = require('./models');
    const defaultLanguage = await Language.findOne({ where: { isDefault: true } });
    
    if (!defaultLanguage) {
      await Language.create({
        code: 'en',
        name: 'English',
        isDefault: true,
      });
      console.log('Default language (English) created');
    }
    
    // Start the server
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

// Start server if not in test mode (to prevent double startup in tests)
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app; 