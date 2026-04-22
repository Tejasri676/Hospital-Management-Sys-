const { executeQuery } = require('../config/db');
const oracledb = require('oracledb');

exports.getStaff = async (req, res) => {
    try {
        const sql = `SELECT staff_id, name, role, email, phone FROM STAFF`;
        const result = await executeQuery(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createStaff = async (req, res) => {
    try {
        const { name, role, email, phone } = req.body;
        const sql = `INSERT INTO STAFF (name, role, email, phone) 
                     VALUES (:name, :role, :email, :phone) 
                     RETURNING staff_id INTO :id`;
        const binds = {
            name,
            role,
            email: email || null,
            phone: phone || null,
            id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };
        const result = await executeQuery(sql, binds);
        res.status(201).json({ staff_id: result.outBinds.id[0], name, role, email, phone });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, email, phone } = req.body;
        const sql = `UPDATE STAFF SET name = :name, role = :role, email = :email, phone = :phone WHERE staff_id = :id`;
        await executeQuery(sql, { name, role, email: email || null, phone: phone || null, id: Number(id) });
        res.json({ message: 'Staff updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        await executeQuery(`DELETE FROM STAFF WHERE staff_id = :id`, [Number(id)]);
        res.json({ message: 'Staff deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getStaff: exports.getStaff,
    createStaff: exports.createStaff,
    updateStaff: exports.updateStaff,
    deleteStaff: exports.deleteStaff
};
