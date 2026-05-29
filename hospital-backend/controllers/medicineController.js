const { executeQuery } = require('../config/db');

const getMedicineColumns = async () => {
    const result = await executeQuery(`
        SELECT column_name
        FROM user_tab_columns
        WHERE table_name = 'MEDICINE'
    `);

    return result.rows.map((row) => row.COLUMN_NAME || row.column_name);
};

const pickColumn = (columns, options) => options.find((column) => columns.includes(column));

exports.getMedicines = async (req, res) => {
    try {
        const columns = await getMedicineColumns();
        const idColumn = pickColumn(columns, ['MED_ID', 'MEDICINE_ID', 'ID']);
        const nameColumn = pickColumn(columns, ['MEDICINE_NAME', 'NAME']);
        const usageColumn = pickColumn(columns, ['USAGE_DESCRIPTION', 'DESCRIPTION']);
        const stockColumn = pickColumn(columns, ['STOCK', 'QUANTITY_IN_STOCK', 'QUANTITY']);
        const priceColumn = pickColumn(columns, ['PRICE', 'UNIT_PRICE']);
        const categoryColumn = pickColumn(columns, ['CATEGORY', 'TYPE']);

        if (!idColumn || !nameColumn) {
            return res.status(500).json({
                error: 'MEDICINE table must have an id column (MED_ID, MEDICINE_ID, or ID) and a name column (MEDICINE_NAME or NAME)',
                columns
            });
        }

        const sql = `
            SELECT
                ${idColumn} AS "med_id",
                ${nameColumn} AS "medicine_name",
                ${usageColumn ? `CAST(DBMS_LOB.SUBSTR(${usageColumn}, 4000, 1) AS VARCHAR2(4000))` : 'NULL'} AS "usage_description",
                ${stockColumn || '0'} AS "stock",
                ${priceColumn || '0'} AS "price",
                ${categoryColumn || 'NULL'} AS "category"
            FROM MEDICINE
            ORDER BY ${idColumn}
        `;
        const result = await executeQuery(sql);
        res.json(result.rows.map((row) => ({
            med_id: row.med_id,
            medicine_name: row.medicine_name,
            usage_description: row.usage_description ? String(row.usage_description) : '',
            stock: Number(row.stock || 0),
            price: Number(row.price || 0),
            category: row.category || ''
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { reduce_by, add_by, stock } = req.body;
        const medicineId = Number(id);
        const columns = await getMedicineColumns();
        const idColumn = pickColumn(columns, ['MED_ID', 'MEDICINE_ID', 'ID']);
        const stockColumn = pickColumn(columns, ['STOCK', 'QUANTITY_IN_STOCK', 'QUANTITY']);

        if (!idColumn || !stockColumn) {
            return res.status(500).json({
                error: 'MEDICINE table must have an id column and a stock column',
                columns
            });
        }

        let sql;
        let binds;

        if (stock !== undefined) {
            const nextStock = Number(stock);
            if (!Number.isFinite(nextStock) || nextStock < 0) {
                return res.status(400).json({ error: 'Stock must be a non-negative number' });
            }

            sql = `UPDATE MEDICINE SET ${stockColumn} = :stock WHERE ${idColumn} = :id`;
            binds = { stock: nextStock, id: medicineId };
        } else if (add_by !== undefined) {
            const addBy = Number(add_by);
            if (!Number.isFinite(addBy) || addBy <= 0) {
                return res.status(400).json({ error: 'Added stock must be greater than zero' });
            }

            sql = `UPDATE MEDICINE SET ${stockColumn} = NVL(${stockColumn}, 0) + :addBy WHERE ${idColumn} = :id`;
            binds = { addBy, id: medicineId };
        } else {
            const reduceBy = Number(reduce_by);
            if (!Number.isFinite(reduceBy) || reduceBy <= 0) {
                return res.status(400).json({ error: 'Reduced stock must be greater than zero' });
            }

            sql = `UPDATE MEDICINE SET ${stockColumn} = GREATEST(NVL(${stockColumn}, 0) - :reduceBy, 0) WHERE ${idColumn} = :id`;
            binds = { reduceBy, id: medicineId };
        }

        await executeQuery(sql, binds);
        res.json({ message: 'Stock updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getMedicines: exports.getMedicines,
    updateStock: exports.updateStock
};
