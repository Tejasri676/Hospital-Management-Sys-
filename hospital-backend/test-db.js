const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
app.use(cors()); // Allows React to talk to this server
app.use(express.json());

const dbConfig = {
  user: "HIS_USER",
  password: "Kartik@2006",
  connectString: "10.213.3.94:1521/orclpdb"
};

// Route to get all doctors
app.get('/api/doctors', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT * FROM Doctors`,
      [], 
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows); // Send data to React
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

app.listen(5000, () => console.log("Backend running on http://localhost:5000"));