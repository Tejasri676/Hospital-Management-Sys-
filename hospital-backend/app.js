// hospital-management-system/backend/app.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const routes = require('./routes');
const { autoDischargeExpiredAdmissions } = require('./controllers/wardController');
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Something went wrong!' });
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const dischargeMonitor = setInterval(async () => {
    try {
        await autoDischargeExpiredAdmissions();
    } catch (err) {
        console.error('Automatic discharge monitor failed:', err.message);
    }
}, 60 * 1000);

void server;
//cd C:\Users\lucky\.gemini\antigravity\scratch\hospital-management-system\backend
//node app.js

//cd C:\Users\lucky\.gemini\antigravity\scratch\hospital-management-system\frontend
//npm run dev
