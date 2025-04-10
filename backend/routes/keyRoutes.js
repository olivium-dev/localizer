const express = require('express');
const router = express.Router();
const keyController = require('../controllers/keyController');

// Routes for keys
router.get('/', keyController.getAllKeys);
router.get('/:id', keyController.getKeyById);
router.post('/', keyController.createKey);
router.put('/:id', keyController.updateKey);
router.delete('/:id', keyController.deleteKey);

module.exports = router; 