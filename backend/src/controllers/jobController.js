const axios = require('axios');
const FormData = require('form-data');

exports.analyzeJob = async (req, res) => {
    try {
        const { job_description, user_skills } = req.body;
        
        const formData = new FormData();
        formData.append('job_description', job_description);

        const aiResponse = await axios.post('http://127.0.0.1:8000/api/analyze-job', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        res.json(aiResponse.data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
