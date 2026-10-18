const { generatePortfolioFromDetails, enhanceContent } = require('../services/aiService');

exports.generateFromDetails = async (req, res) => {
    try {
        const details = req.body;
        console.log("Generating portfolio from user details for:", details.full_name || 'Anonymous');
        const portfolio = await generatePortfolioFromDetails(details);
        res.json({
            message: "Portfolio generated successfully by AI",
            data: portfolio
        });
    } catch (err) {
        console.error("AI Generation error:", err);
        res.status(500).json({ message: "Failed to generate portfolio: " + err.message });
    }
};

exports.enhance = async (req, res) => {
    try {
        const { text, type, role } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Text is required to enhance." });
        }
        const enhanced = await enhanceContent(text, type, role);
        res.json({
            message: "Content enhanced successfully",
            enhanced: enhanced
        });
    } catch (err) {
        console.error("AI Enhance error:", err);
        res.status(500).json({ message: "Failed to enhance content: " + err.message });
    }
};
