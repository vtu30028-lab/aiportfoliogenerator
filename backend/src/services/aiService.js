const axios = require('axios');
const fs = require('fs');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Direct Gemini Job Analyzer fallback
async function directAnalyzeJob(jobDescription, userSkills) {
    if (!GEMINI_API_KEY) {
        return fallbackRuleBasedJobAnalysis(jobDescription, userSkills);
    }

    const prompt = `
    You are an expert technical recruiter and career coach.
    Analyze the following job description and compare it with the candidate's skills.
    
    Candidate Skills:
    ${userSkills || 'Not specified'}
    
    Job Description:
    ${jobDescription.substring(0, 6000)}
    
    Return ONLY a JSON object with EXACTLY these keys:
    - matching_skills (array of strings)
    - missing_skills (array of strings)
    - suggestions (string: concise, actionable advice on what to learn)
    Do NOT include markdown formatting or backticks. Return raw JSON only.
    `;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2 }
        }, { timeout: 25000 });

        if (response.data && response.data.candidates && response.data.candidates[0]) {
            let raw = response.data.candidates[0].content.parts[0].text.trim();
            if (raw.startsWith('```json')) raw = raw.slice(7);
            else if (raw.startsWith('```')) raw = raw.slice(3);
            if (raw.endsWith('```')) raw = raw.slice(0, -3);
            return JSON.parse(raw.trim());
        }
    } catch (err) {
        console.error('Direct Gemini job analysis error:', err.message);
    }

    return fallbackRuleBasedJobAnalysis(jobDescription, userSkills);
}

function fallbackRuleBasedJobAnalysis(jobDescription, userSkills) {
    const userSkillList = (userSkills || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    const commonTech = [
        "React", "Node.js", "JavaScript", "TypeScript", "Python", "SQL", "PostgreSQL",
        "MongoDB", "AWS", "Docker", "Git", "REST APIs", "GraphQL", "Tailwind CSS",
        "HTML", "CSS", "Next.js", "Express", "Kubernetes", "Linux", "CI/CD", "Redux", "Java"
    ];

    const lowerDesc = jobDescription.toLowerCase();
    const matched = [];
    const missing = [];

    commonTech.forEach(tech => {
        if (lowerDesc.includes(tech.toLowerCase())) {
            if (userSkillList.some(u => tech.toLowerCase().includes(u) || u.includes(tech.toLowerCase()))) {
                matched.push(tech);
            } else {
                missing.push(tech);
            }
        }
    });

    return {
        matching_skills: matched.length > 0 ? matched : ["Communication", "Problem Solving"],
        missing_skills: missing.length > 0 ? missing : ["Domain Specific Tools"],
        suggestions: `Focus on mastering ${missing.slice(0, 3).join(', ') || 'core fundamentals'} to strengthen your profile for this position.`
    };
}

module.exports = {
    directAnalyzeJob,
    fallbackRuleBasedJobAnalysis
};
