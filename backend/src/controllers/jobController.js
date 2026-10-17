const axios = require('axios');
const FormData = require('form-data');
const { directAnalyzeJob } = require('../services/aiService');

exports.analyzeJob = async (req, res) => {
    const { job_description, user_skills } = req.body;

    if (!job_description || !job_description.trim()) {
        return res.status(400).json({ message: 'Job description is required.' });
    }

    // Try communicating with Python AI microservice first
    try {
        const formData = new FormData();
        formData.append('job_description', job_description);
        formData.append('user_skills', user_skills || '');

        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
        const aiResponse = await axios.post(`${aiServiceUrl}/api/analyze-job`, formData, {
            headers: { ...formData.getHeaders() },
            timeout: 10000
        });

        if (aiResponse.data && aiResponse.data.data) {
            return res.json(aiResponse.data);
        }
    } catch (err) {
        console.warn("Python AI service unavailable for job analysis, falling back to direct AI engine:", err.message);
    }

    // Direct Gemini fallback
    try {
        const result = await directAnalyzeJob(job_description, user_skills);
        return res.json({ message: "Job analyzed successfully", data: result });
    } catch (error) {
        console.error("Direct analysis failed:", error.message);
        res.status(500).json({ message: 'Failed to analyze job description' });
    }
};
