const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

// Export routes
router.get('/flutter', exportController.exportToFlutter);
router.get('/json', exportController.exportToJson);
router.get('/csv', exportController.exportToCsv);

module.exports = router; 