const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));

        // Send file to Python AI Service
        console.log("Sending file to AI service...");
        const aiResponse = await axios.post('http://127.0.0.1:8000/api/analyze-resume', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        // Clean up uploaded file from Node server after sending to Python
        fs.unlinkSync(req.file.path);

        // Return extracted data back to frontend
        res.json(aiResponse.data);
    } catch (err) {
        console.error("Error communicating with AI service:", err.message);
        if (req.file) {
            fs.unlinkSync(req.file.path); // cleanup on error
        }
        res.status(500).json({ message: 'Failed to process resume' });
    }
};
