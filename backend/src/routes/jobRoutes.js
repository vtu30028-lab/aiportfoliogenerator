const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/analyze', optionalAuth, jobController.analyzeJob);

module.exports = router;
