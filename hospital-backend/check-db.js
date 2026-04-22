const { executeQuery } = require('./config/db');

async function runTest() {
    console.log("--- Starting Database Connection Test ---");
    try {
        // Querying DUAL is the standard way to test an Oracle connection
        const result = await executeQuery("SELECT TO_CHAR(SYSDATE, 'HH24:MI:SS') AS current_time FROM DUAL");
        
        console.log("✅ Success! Connected to Oracle.");
        console.log("Current Database Time:", result.rows[0].CURRENT_TIME);
        
        // Optional: Test if your Doctors table exists
        const tableCheck = await executeQuery("SELECT COUNT(*) AS total FROM Doctor");
        console.log("Doctors Table Check: Found", tableCheck.rows[0].TOTAL, "records.");

    } catch (err) {
        console.error("❌ Connection Failed!");
        console.error("Error Details:", err.message);
        
        if (err.message.includes("DPI-1047")) {
            console.log("\n💡 TIP: Node.js can't find the Instant Client. Check your libDir path.");
        } else if (err.message.includes("ORA-01017")) {
            console.log("\n💡 TIP: Wrong Username or Password.");
        } else if (err.message.includes("ORA-12154")) {
            console.log("\n💡 TIP: Check your Connect String (IP/Service Name).");
        }
    }
}

runTest();