const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');

router.get('/', labController.getLabTests);
router.get('/appointments/available', labController.getAvailableAppointments);
router.post('/order', labController.createTestOrder);
router.post('/result', labController.addTestResult);
router.patch('/:id', labController.updateLabStatus);

module.exports = router;
