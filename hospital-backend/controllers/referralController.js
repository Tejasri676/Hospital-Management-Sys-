const { executeQuery } = require('../config/db');
const oracledb = require('oracledb');

exports.createReferral = async (req, res) => {
    try {
        const { patient_id, referred_to, reason, date, nurse_id } = req.body;

        const sql = `
            INSERT INTO REFERRAL (patient_id, referred_to, reason, referral_date, nurse_id) 
            VALUES (:p_id, :ref_to, :rsn, :dt, :nurse) 
            RETURNING referral_id INTO :id
        `;

        const binds = {
            p_id: patient_id,
            ref_to: referred_to || null,
            rsn: reason || null,
            dt: date ? new Date(date) : new Date(),
            nurse: nurse_id || null,
            id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };

        const result = await executeQuery(sql, binds);

        res.status(201).json({
            referral_id: result.outBinds.id[0],
            patient_id,
            referred_to,
            reason
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getReferrals = async (req, res) => {
    try {
        const sql = `SELECT r.*, p.patient_name as patient_name 
                     FROM REFERRAL r 
                     LEFT JOIN PATIENT p ON r.patient_id = p.patient_id 
                     ORDER BY r.referral_date DESC`;
        const result = await executeQuery(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateReferral = async (req, res) => {
    try {
        const { id } = req.params;
        const { patient_id, referred_to, reason, date, nurse_id } = req.body;
        const sql = `UPDATE REFERRAL SET patient_id = :p_id, referred_to = :ref_to, 
                     reason = :rsn, referral_date = :dt, nurse_id = :nurse 
                     WHERE referral_id = :id`;
        await executeQuery(sql, {
            p_id: patient_id,
            ref_to: referred_to || null,
            rsn: reason || null,
            dt: date ? new Date(date) : null,
            nurse: nurse_id || null,
            id: Number(id)
        });
        res.json({ message: 'Referral updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createReferral: exports.createReferral,
    getReferrals: exports.getReferrals,
    updateReferral: exports.updateReferral
};