const { executeQuery } = require('../config/db');
const oracledb = require('oracledb');

exports.getWards = async (req, res) => {
    try {
        const sql = `SELECT * FROM WARD`;
        const result = await executeQuery(sql);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createAdmission = async (req, res) => {
    try {
        const { patient_id, bed_id, ward_type, bed_number, status, admit_date, total_cost } = req.body;
        const sql = `INSERT INTO ADMISSION (patient_id, bed_id, ward_type, bed_number, admission_date, status, total_cost) 
                     VALUES (:p, :b, :wt, :bn, :d, :s, :tc) RETURNING admission_id INTO :id`;
        const binds = { 
            p: patient_id, 
            b: bed_id || null, 
            wt: ward_type || null,
            bn: bed_number || null,
            d: admit_date ? new Date(admit_date) : new Date(), 
            s: status || 'Admitted',
            tc: total_cost || 0, 
            id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } 
        };
        const result = await executeQuery(sql, binds);
        res.status(201).json({ admission_id: result.outBinds.id[0], status: status || 'Admitted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAdmissions = async (req, res) => {
    try {
        const sql = `SELECT a.*, p.patient_name as patient_name 
                     FROM ADMISSION a 
                     LEFT JOIN PATIENT p ON a.patient_id = p.patient_id 
                     ORDER BY a.admission_date DESC`;
        const result = await executeQuery(sql);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.dischargePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const { discharge_date } = req.body;
        const sql = `UPDATE ADMISSION SET status = 'Discharged', discharge_date = :dd WHERE admission_id = :id`;
        await executeQuery(sql, { dd: discharge_date ? new Date(discharge_date) : new Date(), id: Number(id) });
        res.json({ message: 'Patient discharged' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = {
    getWards: exports.getWards,
    createAdmission: exports.createAdmission,
    getAdmissions: exports.getAdmissions,
    dischargePatient: exports.dischargePatient
};