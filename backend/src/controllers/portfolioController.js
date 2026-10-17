const pool = require('../database/db');

exports.createPortfolio = async (req, res) => {
    try {
        const { title, template, data } = req.body;
        const user_id = req.user.id;

        if (!data) {
            return res.status(400).json({ message: 'Portfolio data is required.' });
        }

        const fullName = data.full_name || 'candidate';
        // Generate clean URL slug
        const cleanName = fullName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'portfolio';
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const slug = `${cleanName}-${randomNum}`;

        // 1. Insert Portfolio
        const portfolioRes = await pool.query(
            'INSERT INTO portfolios (user_id, title, template, slug, is_published) VALUES ($1, $2, $3, $4, $5) RETURNING id, slug, template, title',
            [user_id, title || `${fullName}'s Portfolio`, template || 'modern', slug, true]
        );
        const portfolio = portfolioRes.rows[0];
        const portfolioId = portfolio.id;

        // 2. Insert Personal Info
        await pool.query(
            `INSERT INTO personal_info 
            (portfolio_id, full_name, email, phone, location, professional_summary, career_objective, github_url, linkedin_url, other_urls)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                portfolioId,
                data.full_name || '',
                data.email || '',
                data.phone || '',
                data.location || '',
                data.professional_summary || '',
                data.career_objective || '',
                data.github_url || '',
                data.linkedin_url || '',
                JSON.stringify(data.other_urls || {})
            ]
        );

        // 3. Insert Skills
        if (Array.isArray(data.skills) && data.skills.length > 0) {
            for (const skillName of data.skills) {
                if (typeof skillName === 'string' && skillName.trim()) {
                    await pool.query(
                        'INSERT INTO skills (portfolio_id, category, name) VALUES ($1, $2, $3)',
                        [portfolioId, 'technical', skillName.trim()]
                    );
                }
            }
        }

        // 4. Insert Experience
        if (Array.isArray(data.experience)) {
            for (const exp of data.experience) {
                if (exp && (exp.company || exp.role)) {
                    await pool.query(
                        'INSERT INTO experience (portfolio_id, company, role, description) VALUES ($1, $2, $3, $4)',
                        [portfolioId, exp.company || '', exp.role || '', exp.description || '']
                    );
                }
            }
        }

        // 5. Insert Projects
        if (Array.isArray(data.projects)) {
            for (const proj of data.projects) {
                if (proj && proj.title) {
                    await pool.query(
                        'INSERT INTO projects (portfolio_id, title, description, technologies, link) VALUES ($1, $2, $3, $4, $5)',
                        [
                            portfolioId,
                            proj.title,
                            proj.description || '',
                            JSON.stringify(proj.technologies || []),
                            proj.link || ''
                        ]
                    );
                }
            }
        }

        res.status(201).json({
            message: 'Portfolio created successfully',
            slug: portfolio.slug,
            portfolio: portfolio
        });
    } catch (err) {
        console.error('Create portfolio error:', err);
        res.status(500).json({ message: 'Database error creating portfolio: ' + err.message });
    }
};

exports.getPortfolios = async (req, res) => {
    try {
        const portfolios = await pool.query(
            'SELECT p.*, pi.full_name, pi.professional_summary FROM portfolios p LEFT JOIN personal_info pi ON p.id = pi.portfolio_id WHERE p.user_id = $1 ORDER BY p.created_at DESC',
            [req.user.id]
        );
        res.json(portfolios.rows);
    } catch (err) {
        console.error('Get portfolios error:', err);
        res.status(500).json({ message: 'Server error retrieving portfolios' });
    }
};

exports.getPortfolioBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const portfolioRes = await pool.query('SELECT * FROM portfolios WHERE slug = $1', [slug]);

        if (portfolioRes.rows.length === 0) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        const portfolio = portfolioRes.rows[0];
        const portfolioId = portfolio.id;

        const [personalRes, skillsRes, expRes, projRes] = await Promise.all([
            pool.query('SELECT * FROM personal_info WHERE portfolio_id = $1', [portfolioId]),
            pool.query('SELECT name, category FROM skills WHERE portfolio_id = $1', [portfolioId]),
            pool.query('SELECT * FROM experience WHERE portfolio_id = $1', [portfolioId]),
            pool.query('SELECT * FROM projects WHERE portfolio_id = $1', [portfolioId])
        ]);

        const personalInfo = personalRes.rows[0] || {};
        const skills = skillsRes.rows.map(r => r.name);
        const experience = expRes.rows;
        const projects = projRes.rows.map(p => ({
            ...p,
            technologies: typeof p.technologies === 'string' ? JSON.parse(p.technologies) : (p.technologies || [])
        }));

        res.json({
            portfolio,
            data: {
                ...personalInfo,
                skills,
                experience,
                projects
            }
        });
    } catch (err) {
        console.error('Get portfolio by slug error:', err);
        res.status(500).json({ message: 'Server error retrieving portfolio' });
    }
};

exports.deletePortfolio = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM portfolios WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        res.json({ message: 'Portfolio deleted successfully' });
    } catch (err) {
        console.error('Delete portfolio error:', err);
        res.status(500).json({ message: 'Server error deleting portfolio' });
    }
};
