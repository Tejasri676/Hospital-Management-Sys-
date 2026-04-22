const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

router.get('/', medicineController.getMedicines);
router.patch('/:id/stock', medicineController.updateStock);

module.exports = router;
