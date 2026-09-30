const pool = require('../database/db');

exports.createPortfolio = async (req, res) => {
    try {
        const { title, template, data } = req.body;
        const user_id = req.user.id;
        
        // Generate a random slug
        const slug = `${data.full_name.replace(/\s+/g, '-').toLowerCase()}-${Math.floor(Math.random() * 1000)}`;

        // Insert into portfolios
        const newPortfolio = await pool.query(
            'INSERT INTO portfolios (user_id, title, template, slug) VALUES ($1, $2, $3, $4) RETURNING id, slug',
            [user_id, title, template, slug]
        );
        
        const portfolioId = newPortfolio.rows[0].id;

        // Insert into personal_info
        await pool.query(
            'INSERT INTO personal_info (portfolio_id, full_name, email, phone, location, professional_summary, career_objective, github_url, linkedin_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [portfolioId, data.full_name, data.email, data.phone, data.location, data.professional_summary, data.career_objective, data.github_url, data.linkedin_url]
        );

        // We can similarly insert skills, education, experience iterating over data.skills etc.
        // For brevity in this controller, omitting the loops for skills/education.

        res.status(201).json({ message: 'Portfolio created', slug: newPortfolio.rows[0].slug });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getPortfolios = async (req, res) => {
    try {
        const portfolios = await pool.query('SELECT * FROM portfolios WHERE user_id = $1', [req.user.id]);
        res.json(portfolios.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getPortfolioBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const portfolio = await pool.query('SELECT * FROM portfolios WHERE slug = $1', [slug]);
        
        if (portfolio.rows.length === 0) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        const portfolioId = portfolio.rows[0].id;
        const personalInfo = await pool.query('SELECT * FROM personal_info WHERE portfolio_id = $1', [portfolioId]);
        
        res.json({
            portfolio: portfolio.rows[0],
            data: personalInfo.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
