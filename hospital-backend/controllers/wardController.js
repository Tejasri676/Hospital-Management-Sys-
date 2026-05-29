const { executeQuery } = require('../config/db');
const oracledb = require('oracledb');

const getValue = (row, key) => row?.[key] ?? row?.[key.toUpperCase()] ?? row?.[key.toLowerCase()];

const autoDischargeExpiredAdmissions = async () => {
    await executeQuery(`
        UPDATE ADMISSION
        SET status = 'Discharged'
        WHERE status = 'Admitted'
          AND discharge_date IS NOT NULL
          AND discharge_date <= SYSDATE
    `);
};

exports.getWards = async (req, res) => {
    try {
        await autoDischargeExpiredAdmissions();

        const wardsResult = await executeQuery(`SELECT * FROM WARD ORDER BY ward_id`);
        const admissionsResult = await executeQuery(`
            SELECT ward_type, bed_number
            FROM ADMISSION
            WHERE status = 'Admitted'
        `);

        const occupiedBeds = new Set(
            admissionsResult.rows.map((row) => `${getValue(row, 'ward_type')}::${getValue(row, 'bed_number')}`)
        );

        const beds = [];

        wardsResult.rows.forEach((ward) => {
            const wardId = Number(getValue(ward, 'ward_id'));
            const wardName = getValue(ward, 'ward_name') || getValue(ward, 'ward_type') || `Ward ${wardId}`;
            const wardType = getValue(ward, 'ward_type') || wardName;
            const totalBeds = Number(getValue(ward, 'total_beds') || 0);
            const costPerDay = Number(getValue(ward, 'costperday') || 0);
            let occupiedCount = 0;

            for (let bedNo = 1; bedNo <= totalBeds; bedNo += 1) {
                const bedNumber = String(bedNo);
                const isAvailable = !occupiedBeds.has(`${wardType}::${bedNumber}`);
                if (!isAvailable) occupiedCount += 1;

                beds.push({
                    id: wardId * 10000 + bedNo,
                    bed_id: wardId * 10000 + bedNo,
                    ward_id: wardId,
                    ward_name: wardName,
                    ward_type: wardType,
                    bed_number: bedNumber,
                    total_beds: totalBeds,
                    occupied_beds: 0,
                    available_beds: 0,
                    is_available: isAvailable,
                    cost_per_day: costPerDay
                });
            }

            beds
                .filter((bed) => bed.ward_id === wardId)
                .forEach((bed) => {
                    bed.occupied_beds = occupiedCount;
                    bed.available_beds = Math.max(totalBeds - occupiedCount, 0);
                });
        });

        res.json(beds);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createAdmission = async (req, res) => {
    try {
        await autoDischargeExpiredAdmissions();

        const { patient_id, bed_id, ward_type, bed_number, status, admit_date, discharge_date, total_cost } = req.body;

        if (!patient_id || !ward_type || !bed_number) {
            return res.status(400).json({ error: 'Patient, ward, and bed are required' });
        }

        const activeBed = await executeQuery(
            `SELECT COUNT(*) AS total FROM ADMISSION WHERE ward_type = :wt AND bed_number = :bn AND status = 'Admitted'`,
            { wt: ward_type, bn: String(bed_number) }
        );

        if (Number(getValue(activeBed.rows[0], 'total')) > 0) {
            return res.status(409).json({ error: 'Selected bed is no longer available' });
        }

        const wardCapacity = await executeQuery(
            `SELECT COUNT(*) AS total FROM WARD WHERE ward_type = :wt AND total_beds >= :bedNo`,
            { wt: ward_type, bedNo: Number(bed_number) }
        );

        if (Number(getValue(wardCapacity.rows[0], 'total')) === 0) {
            return res.status(400).json({ error: 'Selected bed is outside ward capacity' });
        }

        const sql = `INSERT INTO ADMISSION (patient_id, bed_id, ward_type, bed_number, admission_date, discharge_date, status, total_cost) 
                     VALUES (:p, :b, :wt, :bn, :d, :dd, :s, :tc) RETURNING admission_id INTO :id`;
        const binds = { 
            p: patient_id, 
            b: bed_id || null, 
            wt: ward_type || null,
            bn: String(bed_number),
            d: admit_date ? new Date(admit_date) : new Date(), 
            dd: discharge_date ? new Date(discharge_date) : null,
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
        await autoDischargeExpiredAdmissions();

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

exports.updateWardCapacity = async (req, res) => {
    try {
        await autoDischargeExpiredAdmissions();

        const { id } = req.params;
        const { add_beds, total_beds } = req.body;
        const wardId = Number(id);

        const wardResult = await executeQuery(`SELECT * FROM WARD WHERE ward_id = :id`, { id: wardId });
        if (wardResult.rows.length === 0) {
            return res.status(404).json({ error: 'Ward not found' });
        }

        const ward = wardResult.rows[0];
        const wardType = getValue(ward, 'ward_type') || getValue(ward, 'ward_name');
        const currentTotal = Number(getValue(ward, 'total_beds') || 0);
        const nextTotal = total_beds !== undefined
            ? Number(total_beds)
            : currentTotal + Number(add_beds || 0);

        if (!Number.isInteger(nextTotal) || nextTotal < 0) {
            return res.status(400).json({ error: 'Total beds must be a valid number' });
        }

        const occupiedResult = await executeQuery(
            `SELECT COUNT(*) AS total FROM ADMISSION WHERE ward_type = :wt AND status = 'Admitted'`,
            { wt: wardType }
        );
        const occupiedBeds = Number(getValue(occupiedResult.rows[0], 'total') || 0);

        if (nextTotal < occupiedBeds) {
            return res.status(400).json({ error: 'Capacity cannot be less than occupied beds' });
        }

        await executeQuery(
            `UPDATE WARD SET total_beds = :total WHERE ward_id = :id`,
            { total: nextTotal, id: wardId }
        );

        res.json({ ward_id: wardId, total_beds: nextTotal, occupied_beds: occupiedBeds, available_beds: nextTotal - occupiedBeds });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = {
    autoDischargeExpiredAdmissions,
    getWards: exports.getWards,
    createAdmission: exports.createAdmission,
    getAdmissions: exports.getAdmissions,
    dischargePatient: exports.dischargePatient,
    updateWardCapacity: exports.updateWardCapacity
};
