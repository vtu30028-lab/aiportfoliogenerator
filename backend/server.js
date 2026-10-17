const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/resume', require('./src/routes/resumeRoutes'));
app.use('/api/portfolio', require('./src/routes/portfolioRoutes'));
app.use('/api/job', require('./src/routes/jobRoutes'));

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({
        message: err.message || 'An unexpected server error occurred.'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});
