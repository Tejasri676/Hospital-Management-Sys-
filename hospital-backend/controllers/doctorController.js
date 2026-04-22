const { executeQuery } = require('../config/db');
const oracledb = require('oracledb');

exports.createDoctor = async (req, res) => {
    try {
        const { name, specialization, qualification, license_no, dept_id, email, consultation_fee } = req.body;
        
        // Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Doctor name is required' });
        }
        if (!specialization || !specialization.trim()) {
            return res.status(400).json({ error: 'Specialization is required' });
        }

        // Check for duplicate email if provided
        if (email && email.trim()) {
            const emailCheckSql = 'SELECT COUNT(*) as cnt FROM DOCTOR WHERE LOWER(email) = LOWER(:email)';
            const emailResult = await executeQuery(emailCheckSql, { email: email.trim() });
            if (emailResult.rows && emailResult.rows[0].cnt > 0) {
                return res.status(409).json({ error: 'Doctor with this email already exists' });
            }
        }

        // Check for duplicate license_no if provided
        if (license_no && license_no.trim()) {
            const licenseCheckSql = 'SELECT COUNT(*) as cnt FROM DOCTOR WHERE license_no = :license_no';
            const licenseResult = await executeQuery(licenseCheckSql, { license_no: license_no.trim() });
            if (licenseResult.rows && licenseResult.rows[0].cnt > 0) {
                return res.status(409).json({ error: 'Doctor with this license number already exists' });
            }
        }
        
        const sql = `INSERT INTO DOCTOR (name, specialization, qualification, license_no, dept_id, email, consultation_fee) 
                     VALUES (:name, :spec, :qual, :lic, :dept, :email, :consultation_fee) 
                     RETURNING doctor_id INTO :id`;
        
        const binds = {
            name: name.trim(),
            spec: specialization.trim() || null,
            qual: qualification ? qualification.trim() : null,
            lic: license_no ? license_no.trim() : null,
            dept: dept_id ? Number(dept_id) : null,
            email: email ? email.trim() : null,
            consultation_fee: consultation_fee ? Number(consultation_fee) : null,
            id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };

        const result = await executeQuery(sql, binds);
        
        res.status(201).json({ 
            doctor_id: result.outBinds.id[0], 
            name: name.trim(), 
            specialization: specialization.trim()
        });
    } catch (err) {
        if (err.code === 'ORA-00001') {
            return res.status(409).json({ error: 'Unique constraint violated. This doctor record may already exist.' });
        }
        res.status(500).json({ error: err.message });
    }
};

exports.getDoctors = async (req, res) => {
    try {
        // Use DOCTOR (singular)
        const sql = `SELECT * FROM DOCTOR`;
        const result = await executeQuery(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      specialization,
      qualification,
      license_no,
      dept_id,
      email,
      consultation_fee,
    } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Doctor name is required' });
    }
    if (!specialization || !specialization.trim()) {
      return res.status(400).json({ error: 'Specialization is required' });
    }

    // Check for duplicate email if provided (excluding current doctor)
    if (email && email.trim()) {
      const emailCheckSql = 'SELECT COUNT(*) as cnt FROM DOCTOR WHERE LOWER(email) = LOWER(:email) AND doctor_id != :id';
      const emailResult = await executeQuery(emailCheckSql, { email: email.trim(), id: Number(id) });
      if (emailResult.rows && emailResult.rows[0].cnt > 0) {
        return res.status(409).json({ error: 'Doctor with this email already exists' });
      }
    }

    // Check for duplicate license_no if provided (excluding current doctor)
    if (license_no && license_no.trim()) {
      const licenseCheckSql = 'SELECT COUNT(*) as cnt FROM DOCTOR WHERE license_no = :license_no AND doctor_id != :id';
      const licenseResult = await executeQuery(licenseCheckSql, { license_no: license_no.trim(), id: Number(id) });
      if (licenseResult.rows && licenseResult.rows[0].cnt > 0) {
        return res.status(409).json({ error: 'Doctor with this license number already exists' });
      }
    }

    const sql = `
      UPDATE DOCTOR
      SET
        name = :name,
        specialization = :spec,
        qualification = :qual,
        license_no = :lic,
        dept_id = :dept,
        email = :email,
        consultation_fee = :consultation_fee
      WHERE doctor_id = :id
    `;

    const binds = {
      id: Number(id),
      name: name.trim(),
      spec: specialization.trim() || null,
      qual: qualification ? qualification.trim() : null,
      lic: license_no ? license_no.trim() : null,
      dept: dept_id || null,
      email: email ? email.trim() : null,
      consultation_fee: consultation_fee ?? null,
    };

    await executeQuery(sql, binds);

    res.json({ message: 'Doctor updated successfully' });
  } catch (err) {
    if (err.code === 'ORA-00001') {
      return res.status(409).json({ error: 'Unique constraint violated. Email or license number may already exist.' });
    }
    console.error('Database Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        await executeQuery(`DELETE FROM DOCTOR WHERE doctor_id = :id`, [Number(id)]);
        res.json({ message: 'Doctor deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createDoctor: exports.createDoctor,
    getDoctors: exports.getDoctors,
    updateDoctor: exports.updateDoctor,
    deleteDoctor: exports.deleteDoctor
};
