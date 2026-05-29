

const oracledb = require('oracledb');


const dbConfig = {
  user: process.env.DB_USER || "HIS_USER",
  password: process.env.DB_PASSWORD || "Kartik@2006",
 connectString: process.env.DB_CONNECT_STRING || 
`(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=127.0.0.1)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=orclpdb)))`
};

async function executeQuery(sql, binds = [], opts = {}) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    // This returns the result in an easy-to-read JSON format
    opts.outFormat = oracledb.OUT_FORMAT_OBJECT;
    opts.autoCommit = true; 
    
    return await connection.execute(sql, binds, opts);
  } catch (err) {
    console.error("Database Error: ", err);
    throw err;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = { executeQuery };