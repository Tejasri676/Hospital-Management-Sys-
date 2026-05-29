const { executeQuery } = require('../config/db');
const oracledb = require('oracledb');

const getValue = (row, key) => row?.[key] ?? row?.[key.toUpperCase()] ?? row?.[key.toLowerCase()];
const pickColumn = (columns, options) => options.find((column) => columns.includes(column));

const getMedicineIdColumn = async () => {
    const result = await executeQuery(`
        SELECT column_name
        FROM user_tab_columns
        WHERE table_name = 'MEDICINE'
    `);
    const columns = result.rows.map((row) => row.COLUMN_NAME || row.column_name);
    return pickColumn(columns, ['MED_ID', 'MEDICINE_ID', 'ID']);
};

const getAppointmentContext = async (apptId) => {
    if (!apptId) return { patientId: null, doctorId: null };

    const result = await executeQuery(
        `SELECT patient_id, doctor_id FROM APPOINTMENT WHERE appt_id = :apptId`,
        { apptId: Number(apptId) }
    );

    if (result.rows.length === 0) return { patientId: null, doctorId: null };

    return {
        patientId: getValue(result.rows[0], 'patient_id'),
        doctorId: getValue(result.rows[0], 'doctor_id')
    };
};

exports.createPrescription = async (req, res) => {
    try {
        const { appt_id, medicines } = req.body;

        if (!appt_id) {
            return res.status(400).json({ error: 'Appointment ID is required' });
        }

        if (!Array.isArray(medicines) || medicines.length === 0) {
            return res.status(400).json({ error: 'At least one medicine is required' });
        }

        const apptContext = await getAppointmentContext(appt_id);

        if (!apptContext.patientId || !apptContext.doctorId) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        let firstPrescId = null;
        for (const med of medicines) {
            const medicineId = Number(med.medicine_id);
            if (!medicineId) {
                return res.status(400).json({ error: 'Valid medicine_id is required for each medicine' });
            }

            const insertSql = `
                INSERT INTO PRESCRIPTION (
                    appt_id, medicine_id, dosage, frequency, presc_date, patient_id, doctor_id
                ) VALUES (
                    :apptId, :medicineId, :dosage, :frequency, SYSDATE, :patientId, :doctorId
                ) RETURNING presc_id INTO :id
            `;
            const binds = {
                apptId: Number(appt_id),
                medicineId,
                dosage: med.dosage || null,
                frequency: med.frequency || null,
                patientId: apptContext.patientId,
                doctorId: apptContext.doctorId,
                id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            };

            const insertResult = await executeQuery(insertSql, binds);
            if (!firstPrescId) {
                firstPrescId = insertResult.outBinds.id[0];
            }
        }

        res.status(201).json({
            presc_id: firstPrescId,
            message: 'Prescription created successfully'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addMedicineToPrescription = async (req, res) => {
    try {
        const presId = Number(req.params.id);
        const { medicine_id, med_id, dosage, frequency, quantity, duration } = req.body;
        const medicineId = medicine_id || med_id;

        const existing = await executeQuery(
            `SELECT appt_id, patient_id, doctor_id FROM PRESCRIPTION WHERE presc_id = :presId`,
            { presId }
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Prescription not found' });
        }

        if (!medicineId || Number.isNaN(Number(medicineId))) {
            return res.status(400).json({ error: 'Valid medicine_id is required' });
        }

        const row = existing.rows[0];
        const sql = `
            INSERT INTO PRESCRIPTION (
                appt_id, medicine_id, dosage, frequency, presc_date, patient_id, doctor_id
            )
            VALUES (
                :apptId, :medicineId, :dosage, :frequency, SYSDATE, :patientId, :doctorId
            )
            RETURNING presc_id INTO :id
        `;

        const binds = {
            medicineId: Number(medicineId),
            dosage: dosage || null,
            frequency: frequency || duration || (quantity ? `Qty ${quantity}` : null),
            patientId: getValue(row, 'patient_id') || null,
            doctorId: getValue(row, 'doctor_id') || null,
            apptId: getValue(row, 'appt_id') || null
        };

        await executeQuery(sql, binds);

        res.status(201).json({
            pres_id: presId,
            medicine_id: medicineId,
            message: 'Medicine added to prescription successfully'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPrescriptions = async (req, res) => {
    try {
        const medicineIdColumn = await getMedicineIdColumn();
        if (!medicineIdColumn) {
            return res.status(500).json({ error: 'MEDICINE table id column not found' });
        }

        const sql = `
            SELECT
                pr.presc_id,
                pr.appt_id,
                COALESCE(pr.patient_id, a.patient_id) as patient_id,
                COALESCE(pr.doctor_id, a.doctor_id) as doctor_id,
                pr.presc_date,
                pr.medicine_id,
                pr.dosage,
                pr.frequency,
                m.medicine_name,
                pt.patient_name,
                d.name AS doctor_name
            FROM PRESCRIPTION pr
            LEFT JOIN APPOINTMENT a ON pr.appt_id = a.appt_id
            LEFT JOIN MEDICINE m ON pr.medicine_id = m.${medicineIdColumn}
            LEFT JOIN PATIENT pt ON COALESCE(pr.patient_id, a.patient_id) = pt.patient_id
            LEFT JOIN DOCTOR d ON COALESCE(pr.doctor_id, a.doctor_id) = d.doctor_id
            ORDER BY pr.presc_id DESC
        `;
        const result = await executeQuery(sql);
        const prescriptions = new Map();

        for (const row of result.rows) {
            const prescId = getValue(row, 'presc_id');
            const groupId = prescId;

            if (!prescriptions.has(groupId)) {
                prescriptions.set(groupId, {
                    id: prescId,
                    pres_id: prescId,
                    prescription_id: prescId,
                    appointmentId: getValue(row, 'appt_id'),
                    app_id: getValue(row, 'appt_id'),
                    patientId: getValue(row, 'patient_id'),
                    patient_id: getValue(row, 'patient_id'),
                    patient_name: getValue(row, 'patient_name'),
                    doctorId: getValue(row, 'doctor_id'),
                    doctor_id: getValue(row, 'doctor_id'),
                    doctor_name: getValue(row, 'doctor_name'),
                    date: getValue(row, 'presc_date'),
                    medicines: []
                });
            }

            if (getValue(row, 'medicine_id')) {
                prescriptions.get(groupId).medicines.push({
                    medicineId: getValue(row, 'medicine_id'),
                    med_id: getValue(row, 'medicine_id'),
                    medicine_name: getValue(row, 'medicine_name'),
                    dosage: getValue(row, 'dosage'),
                    frequency: getValue(row, 'frequency'),
                    quantity: 1,
                    duration: '',
                    purchased: false
                });
            }
        }

        res.json(Array.from(prescriptions.values()));
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
                     WHERE UPPER(a.status) IN ('SCHEDULED', 'COMPLETED', 'IN-PROGRESS')
                     ORDER BY a.appt_date DESC`;
        const result = await executeQuery(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.markPurchased = async (req, res) => {
    try {
        const presId = Number(req.params.id);
        const medId = Number(req.params.medId);
        const medicineIdColumn = await getMedicineIdColumn();

        if (!medicineIdColumn) {
            return res.status(500).json({ error: 'MEDICINE table id column not found' });
        }

        await executeQuery(
            `UPDATE MEDICINE SET stock = GREATEST(NVL(stock, 0) - 1, 0) WHERE ${medicineIdColumn} = :medId`,
            { medId }
        );

        res.json({ message: 'Medicine marked as purchased', pres_id: presId, medicine_id: medId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deletePrescription = async (req, res) => {
    try {
        const presId = Number(req.params.id);
        if (!presId) {
            return res.status(400).json({ error: 'Valid prescription ID is required' });
        }

        const existing = await executeQuery(
            `SELECT presc_id FROM PRESCRIPTION WHERE presc_id = :presId`,
            { presId }
        );
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: 'Prescription not found' });
        }

        await executeQuery(
            `DELETE FROM PRESCRIPTION WHERE presc_id = :presId`,
            { presId }
        );

        res.json({ message: 'Prescription deleted successfully', presc_id: presId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createPrescription: exports.createPrescription,
    addMedicineToPrescription: exports.addMedicineToPrescription,
    getPrescriptions: exports.getPrescriptions,
    getAvailableAppointments: exports.getAvailableAppointments,
    markPurchased: exports.markPurchased,
    deletePrescription: exports.deletePrescription
};
