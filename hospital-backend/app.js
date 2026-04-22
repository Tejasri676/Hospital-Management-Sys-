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
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//cd C:\Users\lucky\.gemini\antigravity\scratch\hospital-management-system\backend
//node app.js

//cd C:\Users\lucky\.gemini\antigravity\scratch\hospital-management-system\frontend
//npm run dev

