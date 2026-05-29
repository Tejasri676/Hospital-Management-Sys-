const { executeQuery } = require('../config/db');
const oracledb = require('oracledb');

exports.createAppointment = async (req, res) => {
    try {
        const { patient_id, doctor_id, appt_date, date, time, duration, reason, height, weight, status, is_followup, fee } = req.body;
        const resolvedDate = appt_date || (date ? `${date}${time ? `T${time}` : ''}` : null);
        const resolvedTime = time ? new Date(`1970-01-01T${time}:00`) : null;
        const sql = `INSERT INTO APPOINTMENT (
                        patient_id, doctor_id, appt_date, appt_time, duration_mins, reason, height, weight, status, consultation_fee, notes
                     ) VALUES (
                        :p, :d, :dt, :tm, :dur, :r, :h, :w, :s, :f, :n
                     ) RETURNING appt_id INTO :id`;
        const binds = {
            p: patient_id,
            d: doctor_id,
            dt: resolvedDate ? new Date(resolvedDate) : null,
            tm: resolvedTime,
            dur: duration || 30,
            r: reason || null,
            h: height || null,
            w: weight || null,
            s: status || 'Scheduled',
            f: fee || 0,
            n: is_followup ? 'Follow-up' : null,
            id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };
        const result = await executeQuery(sql, binds);
        res.status(201).json({ appt_id: result.outBinds.id[0], ...req.body });
    } catch (err) { res.status(500).json({ error: err.message }); }
};


exports.getAppointments = async (req, res) => {
    try {
        // Get appointments with patient and doctor info
        const sql = `SELECT a.*, p.patient_name as patient_name, d.name as doctor_name
                     FROM APPOINTMENT a
                     LEFT JOIN PATIENT p ON a.patient_id = p.patient_id
                     LEFT JOIN DOCTOR d ON a.doctor_id = d.doctor_id
                     ORDER BY a.appt_date DESC`;
        const result = await executeQuery(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { patient_id, doctor_id, appt_date, date, time, duration, reason, height, weight, status, is_followup, fee } = req.body;
        const resolvedDate = appt_date || (date ? `${date}${time ? `T${time}` : ''}` : null);
        const resolvedTime = time ? new Date(`1970-01-01T${time}:00`) : null;
        const sql = `UPDATE APPOINTMENT SET patient_id = :p, doctor_id = :d, appt_date = :dt, appt_time = :tm,
                     duration_mins = :dur, reason = :r, height = :h, weight = :w,
                     status = :s, consultation_fee = :f, notes = :n
                     WHERE appt_id = :id`;
        const binds = {
            id: Number(id),
            p: patient_id,
            d: doctor_id,
            dt: resolvedDate ? new Date(resolvedDate) : null,
            tm: resolvedTime,
            dur: duration || 30,
            r: reason || null,
            h: height || null,
            w: weight || null,
            s: status || null,
            f: fee || 0,
            n: is_followup ? 'Follow-up' : null
        };
        await executeQuery(sql, binds);
        res.json({ message: 'Appointment updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createAppointment: exports.createAppointment,
    getAppointments: exports.getAppointments,
    updateAppointment: exports.updateAppointment
};