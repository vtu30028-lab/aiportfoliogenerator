const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/resume', require('./src/routes/resumeRoutes'));
app.use('/api/portfolio', require('./src/routes/portfolioRoutes'));
app.use('/api/job', require('./src/routes/jobRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
