const express = require('express');

const router = express.Router();
const patientController = require('../controllers/patientController');

router.post('/', patientController.createPatient);
router.get('/', patientController.getPatients);
router.get('/all', patientController.getPatients);
router.get('/All', patientController.getPatients);
router.get('/:id', patientController.getPatientDetails);
router.put('/:id', patientController.updatePatient);
router.delete('/:id', patientController.deletePatient);

module.exports = router;
