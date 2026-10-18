const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/generate-portfolio', optionalAuth, aiController.generateFromDetails);
router.post('/enhance', optionalAuth, aiController.enhance);

module.exports = router;
