const { executeQuery } = require('../config/db');

exports.getMedicines = async (req, res) => {
    try {
        const sql = `SELECT * FROM MEDICINE`;
        const result = await executeQuery(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { reduce_by } = req.body;
        const sql = `UPDATE MEDICINE SET stock = stock - :reduce WHERE med_id = :id`;
        await executeQuery(sql, { reduce: Number(reduce_by), id: Number(id) });
        res.json({ message: 'Stock updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getMedicines: exports.getMedicines,
    updateStock: exports.updateStock
};
