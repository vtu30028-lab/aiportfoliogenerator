const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const auth = require('../middleware/authMiddleware');

router.post('/analyze', auth, jobController.analyzeJob);

module.exports = router;
