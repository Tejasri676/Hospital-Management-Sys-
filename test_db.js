const oracledb = require('oracledb');
async function test() {
  try {
    const conn = await oracledb.getConnection({
      user: "HIS_USER",
      password: "Kartik@2006",
      connectString: "127.0.0.1:1521/orclpdb"
    });
    console.log("Connection Success!");
    await conn.close();
  } catch (err) {
    console.error("Connection Failed:", err.message);
  }
}
test();