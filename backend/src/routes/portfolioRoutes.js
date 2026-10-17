const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, portfolioController.createPortfolio);
router.get('/', auth, portfolioController.getPortfolios);
router.get('/:slug', portfolioController.getPortfolioBySlug);
router.delete('/:id', auth, portfolioController.deletePortfolio);

module.exports = router;
