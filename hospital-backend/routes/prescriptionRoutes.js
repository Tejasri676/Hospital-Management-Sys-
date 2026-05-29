const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');

router.get('/', prescriptionController.getPrescriptions);
router.get('/appointments/available', prescriptionController.getAvailableAppointments);
router.post('/', prescriptionController.createPrescription);
router.post('/:id/medicines', prescriptionController.addMedicineToPrescription);
router.patch('/:id/medicines/:medId', prescriptionController.markPurchased);
router.delete('/:id', prescriptionController.deletePrescription);

module.exports = router;
