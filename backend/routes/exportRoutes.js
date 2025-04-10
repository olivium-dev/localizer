const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

// Export routes
router.get('/flutter', exportController.exportToFlutter);

module.exports = router; 