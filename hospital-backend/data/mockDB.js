// MOCK DATABASE
// In-memory data store for the Hospital Management System

const db = {
    patients: [],
    doctors: [
        { doctor_id: 1, name: 'Dr. John Smith', specialization_id: 1 },
        { doctor_id: 2, name: 'Dr. Sarah Connor', specialization_id: 2 }
    ],
    specializations: [
        { spec_id: 1, name: 'Cardiology' },
        { spec_id: 2, name: 'Neurology' },
        { spec_id: 3, name: 'Pediatrics' }
    ],
    appointments: [],
    prescriptions: [],
    medicines: [
        { med_id: 1, name: 'Aspirin' },
        { med_id: 2, name: 'Ibuprofen' },
        { med_id: 3, name: 'Amoxicillin' }
    ],
    prescription_medicines: [],
    lab_tests: [
        { test_id: 1, name: 'Blood Test' },
        { test_id: 2, name: 'MRI Scan' },
        { test_id: 3, name: 'X-Ray' }
    ],
    test_orders: [],
    test_results: [],
    wards: [
        { ward_id: 1, type: 'General' },
        { ward_id: 2, type: 'ICU' }
    ],
    beds: [
        { bed_id: 1, ward_id: 1, status: 'available' },
        { bed_id: 2, ward_id: 1, status: 'occupied' },
        { bed_id: 3, ward_id: 2, status: 'available' }
    ],
    admissions: [],
    referrals: []
};

// Simple ID generators
const generateId = (table) => {
    if (table.length === 0) return 1;
    const ids = table.map(item => Object.values(item)[0]); // Assumes ID is the first key
    return Math.max(...ids) + 1;
};

module.exports = {
    db,
    generateId
};
