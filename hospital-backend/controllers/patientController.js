const { executeQuery } = require('../config/db');
const oracledb = require('oracledb');

exports.createPatient = async (req, res) => {
    try {
        const { name, dob, gender, blood_group, address, phone } = req.body;
        
        // --- DEBUG LOG ---
        console.log(`🚀 POST Request received for patient: ${name}`);

        const sql = `INSERT INTO PATIENT (patient_name, dob, gender, blood_group, address, phone) 
                     VALUES (:name, :dob, :gender, :bg, :addr, :ph) 
                     RETURNING patient_id INTO :id`;
        
        const binds = { 
            name, 
            dob: new Date(dob), 
            gender, 
            bg: blood_group,
            addr: address || null,
            ph: phone || null,
            id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } 
        };
        
        const result = await executeQuery(sql, binds);
        
        // --- DEBUG LOG ---
        console.log(`✅ Success: Patient saved with ID ${result.outBinds.id[0]}`);

        res.status(201).json({ patient_id: result.outBinds.id[0], name, dob, gender });
    } catch (err) { 
        console.error("❌ Database Error:", err.message);
        res.status(500).json({ error: err.message }); 
    }
};

exports.getPatients = async (req, res) => {
    try {
        console.log("🔍 Fetching all patients...");
        const result = await executeQuery("SELECT * FROM PATIENT");
        res.json(result.rows);
    } catch (err) { 
        console.error("❌ Fetch Error:", err.message);
        res.status(500).json({ error: err.message }); 
    }
};
exports.getPatientDetails = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        console.log(`🔍 Fetching details for patient ID: ${id}`);

        const pRes = await executeQuery("SELECT * FROM PATIENT WHERE patient_id = :id", [id]);
        
        if (pRes.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
        
        const appts = await executeQuery(
            "SELECT a.*, d.name as doctor_name FROM Appointment a JOIN Doctor d ON a.doctor_id = d.doctor_id WHERE a.patient_id = :id", 
            [id]
        );
        const labs = await executeQuery("SELECT * FROM Lab_test WHERE patient_id = :id", [id]);
        const admits = await executeQuery("SELECT * FROM Admission WHERE patient_id = :id", [id]);

        res.json({ 
            ...pRes.rows[0], 
            history: { 
                appointments: appts.rows, 
                lab_orders: labs.rows, 
                admissions: admits.rows 
            } 
        });
    } catch (err) { 
        console.error("❌ Details Fetch Error:", err.message);
        res.status(500).json({ error: err.message }); 
    }
};

exports.updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, dob, gender, blood_group, address, phone } = req.body;
        const sql = `UPDATE PATIENT SET patient_name = :name, dob = :dob, gender = :gender, 
                     blood_group = :bg, address = :addr, phone = :ph 
                     WHERE patient_id = :id`;
        const binds = {
            name,
            dob: dob ? new Date(dob) : null,
            gender,
            bg: blood_group || null,
            addr: address || null,
            ph: phone || null,
            id: Number(id)
        };
        await executeQuery(sql, binds);
        res.json({ message: 'Patient updated successfully' });
    } catch (err) {
        console.error("❌ Update Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.deletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const patientId = Number(id);

        if (!patientId) {
            return res.status(400).json({ error: 'Valid patient ID is required' });
        }

        const existing = await executeQuery("SELECT patient_id FROM PATIENT WHERE patient_id = :id", { id: patientId });
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        await executeQuery("DELETE FROM PATIENT WHERE patient_id = :id", { id: patientId });
        res.json({ message: 'Patient deleted successfully' });
    } catch (err) {
        if (err && err.errorNum === 2292) {
            return res.status(409).json({
                error: 'Cannot delete patient because related records exist (appointments, prescriptions, labs, or admissions).'
            });
        }
        console.error("❌ Delete Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};



module.exports = {
    createPatient: exports.createPatient,
    getPatients: exports.getPatients,
    getPatientDetails: exports.getPatientDetails,
    updatePatient: exports.updatePatient,
    deletePatient: exports.deletePatient
};