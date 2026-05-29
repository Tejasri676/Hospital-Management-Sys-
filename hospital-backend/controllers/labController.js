const { executeQuery } = require('../config/db');
const oracledb = require('oracledb');

exports.createTestOrder = async (req, res) => {
    try {
        const { appointment_id, patient_id, doctor_id, test_name, date } = req.body;
        let sql, binds;
        
        if (appointment_id) {
            const appointment = await executeQuery(
                `SELECT patient_id, doctor_id FROM APPOINTMENT WHERE appt_id = :appt`,
                { appt: Number(appointment_id) }
            );

            if (appointment.rows.length === 0) {
                return res.status(404).json({ error: 'Appointment not found' });
            }

            const apptRow = appointment.rows[0];

            sql = `INSERT INTO LAB_TEST (appt_id, patient_id, doctor_id, test_name, test_date, status) 
                   VALUES (:appt, :p, :d, :tn, :dt, 'Pending') RETURNING test_id INTO :id`;
            binds = { 
                appt: Number(appointment_id),
                p: apptRow.PATIENT_ID ?? apptRow.patient_id,
                d: apptRow.DOCTOR_ID ?? apptRow.doctor_id,
                tn: test_name, 
                dt: date ? new Date(date) : new Date(), 
                id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } 
            };
        } else {
            if (!patient_id || !doctor_id) {
                return res.status(400).json({ error: 'Patient and doctor are required when appointment is not provided' });
            }

            sql = `INSERT INTO LAB_TEST (patient_id, doctor_id, test_name, test_date, status) 
                   VALUES (:p, :d, :tn, :dt, 'Pending') RETURNING test_id INTO :id`;
            binds = { 
                p: Number(patient_id), 
                d: Number(doctor_id), 
                tn: test_name, 
                dt: date ? new Date(date) : new Date(), 
                id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } 
            };
        }
        
        const result = await executeQuery(sql, binds);
        res.status(201).json({ test_id: result.outBinds.id[0], status: 'Pending' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addTestResult = async (req, res) => {
    try {
        const { test_id, order_id, result_text, result } = req.body;
        const id = test_id || order_id;
        const resultVal = result_text || (typeof result === 'object' ? result.result : result) || '';
        const remarks = typeof result === 'object' ? result.remarks : '';
        const sql = `UPDATE LAB_TEST SET result = :res, remarks = :rem, status = 'Completed', result_date = SYSDATE WHERE test_id = :id`;
        await executeQuery(sql, { res: resultVal, rem: remarks || null, id: id });
        res.status(200).json({ message: 'Result added' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getLabTests = async (req, res) => {
    try {
        const sql = `
            SELECT
                lt.*,
                p.patient_name AS patient_name,
                d.name AS doctor_name
            FROM LAB_TEST lt
            LEFT JOIN PATIENT p ON lt.patient_id = p.patient_id
            LEFT JOIN DOCTOR d ON lt.doctor_id = d.doctor_id
            ORDER BY lt.test_date DESC
        `;
        const result = await executeQuery(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateLabStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, lab_tech_id } = req.body;
        const sql = `UPDATE LAB_TEST SET status = :status WHERE test_id = :id`;
        await executeQuery(sql, { status, id: Number(id) });
        res.json({ message: 'Lab test status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAvailableAppointments = async (req, res) => {
    try {
        const sql = `SELECT a.appt_id as id, a.appt_id, a.patient_id, a.doctor_id, a.appt_date, a.reason, a.status,
                            p.patient_name, d.name as doctor_name
                     FROM APPOINTMENT a
                     LEFT JOIN PATIENT p ON a.patient_id = p.patient_id
                     LEFT JOIN DOCTOR d ON a.doctor_id = d.doctor_id
                     WHERE a.status IN ('Scheduled', 'Completed', 'In-Progress')
                     ORDER BY a.appt_date DESC`;
        const result = await executeQuery(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getLabTests: exports.getLabTests,
    createTestOrder: exports.createTestOrder,
    addTestResult: exports.addTestResult,
    updateLabStatus: exports.updateLabStatus,
    getAvailableAppointments: exports.getAvailableAppointments
};
