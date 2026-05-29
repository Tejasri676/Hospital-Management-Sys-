const express = require('express');
const router = express.Router();

const patientRoutes = require('./patientRoutes');
const doctorRoutes = require('./doctorRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const prescriptionRoutes = require('./prescriptionRoutes');
const labRoutes = require('./labRoutes');
const wardRoutes = require('./wardRoutes');
const referralRoutes = require('./referralRoutes');
const medicineRoutes = require('./medicineRoutes');
const staffRoutes = require('./staffRoutes');

const wardController = require('../controllers/wardController');

router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/lab-tests', labRoutes);
router.use('/medicines', medicineRoutes);
router.use('/staff', staffRoutes);

// Ward & Admission endpoints
router.get('/wards', wardController.getWards);
router.patch('/wards/:id/capacity', wardController.updateWardCapacity);
router.post('/admissions', wardController.createAdmission);
router.get('/admissions', wardController.getAdmissions);
router.patch('/admissions/:id/discharge', wardController.dischargePatient);

router.use('/referrals', referralRoutes);

module.exports = router;
