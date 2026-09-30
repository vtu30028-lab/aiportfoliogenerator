import os

files = {
    'backend/server.js': '''const express = require('express');
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
''',
    'backend/src/database/db.js': '''const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ai_portfolio',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
''',
    'backend/src/routes/authRoutes.js': '''const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
''',
    'backend/src/routes/resumeRoutes.js': '''const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', upload.single('resume'), resumeController.uploadResume);

module.exports = router;
''',
    'backend/src/routes/portfolioRoutes.js': '''const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, portfolioController.createPortfolio);
router.get('/', auth, portfolioController.getPortfolios);
router.get('/:slug', portfolioController.getPortfolioBySlug);

module.exports = router;
''',
    'backend/src/routes/jobRoutes.js': '''const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const auth = require('../middleware/authMiddleware');

router.post('/analyze', auth, jobController.analyzeJob);

module.exports = router;
''',
    'backend/src/middleware/uploadMiddleware.js': '''const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
module.exports = upload;
''',
    'backend/src/middleware/authMiddleware.js': '''const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Auth error' });

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (e) {
        res.status(500).send({ message: 'Invalid Token' });
    }
};
''',
    'backend/src/controllers/authController.js': '''exports.register = async (req, res) => {
    res.json({ message: 'Register endpoint' });
};
exports.login = async (req, res) => {
    res.json({ message: 'Login endpoint' });
};
''',
    'backend/src/controllers/resumeController.js': '''exports.uploadResume = async (req, res) => {
    res.json({ message: 'Upload resume endpoint' });
};
''',
    'backend/src/controllers/portfolioController.js': '''exports.createPortfolio = async (req, res) => {
    res.json({ message: 'Create portfolio endpoint' });
};
exports.getPortfolios = async (req, res) => {
    res.json({ message: 'Get portfolios endpoint' });
};
exports.getPortfolioBySlug = async (req, res) => {
    res.json({ message: 'Get portfolio by slug endpoint' });
};
''',
    'backend/src/controllers/jobController.js': '''exports.analyzeJob = async (req, res) => {
    res.json({ message: 'Analyze job endpoint' });
};
'''
}

for filepath, content in files.items():
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
