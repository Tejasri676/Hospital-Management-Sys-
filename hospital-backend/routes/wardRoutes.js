const express = require('express');
const router = express.Router();
const wardController = require('../controllers/wardController');

router.get('/', wardController.getWards);
router.post('/admissions', wardController.createAdmission); // Mapped to /api/wards/admissions to keep endpoint clean, but spec said /admissions, so I'll handle that in index.js routing.

// Wait, spec says POST /admissions. Let's make sure index map it correctly.
module.exports = router;
