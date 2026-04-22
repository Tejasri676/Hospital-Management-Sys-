const { executeQuery } = require('../config/db');
const oracledb = require('oracledb');

exports.createTestOrder = async (req, res) => {
    try {
        const { appointment_id, patient_id, doctor_id, test_name, date } = req.body;
        let sql, binds;
        
        if (appointment_id) {
            // Frontend sends appointment_id - look up patient/doctor from appointment
            sql = `INSERT INTO LAB_TEST (appt_id, test_name, test_date, status) 
                   VALUES (:appt, :tn, :dt, 'Pending') RETURNING test_id INTO :id`;
            binds = { 
                appt: appointment_id, 
                tn: test_name, 
                dt: date ? new Date(date) : new Date(), 
                id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } 
            };
        } else {
            sql = `INSERT INTO LAB_TEST (patient_id, doctor_id, test_name, test_date, status) 
                   VALUES (:p, :d, :tn, :dt, 'Pending') RETURNING test_id INTO :id`;
            binds = { 
                p: patient_id, 
                d: doctor_id, 
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
        // SQL: Matches PDF table name LAB_TEST [cite: 80]
        const sql = `SELECT * FROM LAB_TEST ORDER BY test_date DESC`;
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

module.exports = {
    getLabTests: exports.getLabTests,
    createTestOrder: exports.createTestOrder,
    addTestResult: exports.addTestResult,
    updateLabStatus: exports.updateLabStatus
};