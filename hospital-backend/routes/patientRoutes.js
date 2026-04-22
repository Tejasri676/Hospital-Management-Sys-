const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

router.post('/', patientController.createPatient);
router.get('/All', patientController.getPatients);
router.get('/:id', patientController.getPatientDetails);
router.put('/:id', patientController.updatePatient);

module.exports = router;
