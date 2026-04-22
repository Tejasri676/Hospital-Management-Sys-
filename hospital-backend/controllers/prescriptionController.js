const { executeQuery } = require('../config/db');
const oracledb = require('oracledb');

// CREATE: Creates the main prescription record linked to an appointment
exports.createPrescription = async (req, res) => {
    try {
        const { appointment_id, app_id, date } = req.body;
        const apptId = appointment_id || app_id;

        const sql = `
            INSERT INTO PRESCRIPTION (Appt_id, Presc_date) 
            VALUES (:app_id, SYSDATE) 
            RETURNING Presc_id INTO :id
        `;

        const binds = {
            app_id: apptId,
            id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };

        const result = await executeQuery(sql, binds);

        const newPrescription = {
            pres_id: result.outBinds.id[0],
            id: result.outBinds.id[0],
            prescription_id: result.outBinds.id[0],
            app_id: apptId,
            appointmentId: apptId
        };

        res.status(201).json(newPrescription);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ADD MEDICINE: Links specific medicines to a prescription
exports.addMedicineToPrescription = async (req, res) => {
    try {
        const id = parseInt(req.params.id); // pres_id from URL
        const { med_id, medicine_id, dosage, quantity, duration, frequency } = req.body;
        const medicineIdVal = medicine_id || med_id;
        const dosageVal = dosage || frequency || '';

        // 1. Ensure prescription exists
        const checkSql = `SELECT Presc_id FROM PRESCRIPTION WHERE Presc_id = :id`;
        const checkResult = await executeQuery(checkSql, [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Prescription not found' });
        }

        // 2. Insert into the joining table
        const insertSql = `
            INSERT INTO PRESCRIPTION_MEDICINES (Presc_id, Medicine_id, Dosage, Quantity, Duration) 
            VALUES (:pres_id, :med_id, :dosage, :qty, :duration)
        `;

        await executeQuery(insertSql, {
            pres_id: id,
            med_id: medicineIdVal,
            dosage: dosageVal,
            qty: quantity || null,
            duration: duration || null
        });

        res.status(201).json({
            pres_id: id,
            med_id: medicineIdVal,
            dosage: dosageVal
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET ALL: Returns all prescriptions with their medicines
exports.getPrescriptions = async (req, res) => {
    try {
        const sql = `SELECT p.Presc_id, p.Appt_id, p.Presc_date,
                     pm.Medicine_id, pm.Dosage, pm.Quantity, pm.Duration,
                     m.name as medicine_name
                     FROM PRESCRIPTION p
                     LEFT JOIN PRESCRIPTION_MEDICINES pm ON p.Presc_id = pm.Presc_id
                     LEFT JOIN MEDICINE m ON pm.Medicine_id = m.med_id
                     ORDER BY p.Presc_id DESC`;
        const result = await executeQuery(sql);
        
        // Group medicines by prescription
        const presMap = {};
        for (const row of result.rows) {
            const pid = row.PRESC_ID;
            if (!presMap[pid]) {
                presMap[pid] = {
                    id: pid,
                    pres_id: pid,
                    prescription_id: pid,
                    appointmentId: row.APPT_ID,
                    app_id: row.APPT_ID,
                    date: row.PRESC_DATE,
                    medicines: []
                };
            }
            if (row.MEDICINE_ID) {
                presMap[pid].medicines.push({
                    medicineId: row.MEDICINE_ID,
                    med_id: row.MEDICINE_ID,
                    medicine_name: row.MEDICINE_NAME,
                    dosage: row.DOSAGE,
                    frequency: row.DOSAGE,
                    quantity: row.QUANTITY,
                    duration: row.DURATION,
                    purchased: false
                });
            }
        }
        
        res.json(Object.values(presMap));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// MARK PURCHASED: Mark a medicine in a prescription as purchased
exports.markPurchased = async (req, res) => {
    try {
        const presId = parseInt(req.params.id);
        const medId = parseInt(req.params.medId);
        const sql = `UPDATE PRESCRIPTION_MEDICINES SET purchased = 1 
                     WHERE Presc_id = :pid AND Medicine_id = :mid`;
        await executeQuery(sql, { pid: presId, mid: medId });
        res.json({ message: 'Medicine marked as purchased' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createPrescription: exports.createPrescription,
    addMedicineToPrescription: exports.addMedicineToPrescription,
    getPrescriptions: exports.getPrescriptions,
    markPurchased: exports.markPurchased
};