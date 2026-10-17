const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { parseResumeDirect } = require('../services/resumeParser');

exports.uploadResume = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded. Please select a PDF or DOCX file.' });
    }

    const filePath = req.file.path;

    // 1. Try communicating with Python AI Service
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
        const aiResponse = await axios.post(`${aiServiceUrl}/api/analyze-resume`, formData, {
            headers: { ...formData.getHeaders() },
            timeout: 15000
        });

        // Clean up uploaded file
        if (fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) {}
        }

        if (aiResponse.data && aiResponse.data.data) {
            return res.json(aiResponse.data);
        }
    } catch (err) {
        console.warn("Python AI service unavailable for resume, using direct engine:", err.message);
    }

    // 2. Direct Node.js + Gemini / NLP fallback
    try {
        const parsedData = await parseResumeDirect(filePath);
        
        // Clean up file
        if (fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) {}
        }

        return res.json({
            message: "Resume analyzed successfully",
            data: parsedData
        });
    } catch (err) {
        console.error("Resume parsing error:", err.message);
        if (fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) {}
        }
        res.status(500).json({ message: 'Failed to process resume document.' });
    }
};
