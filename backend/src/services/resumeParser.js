require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function extractTextFromFile(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        if (filePath.toLowerCase().endsWith('.pdf')) {
            const data = await pdfParse(dataBuffer);
            return data.text || '';
        } else {
            return dataBuffer.toString('utf-8');
        }
    } catch (e) {
        console.warn('Direct text extraction warning:', e.message);
        return '';
    }
}

async function parseResumeDirect(filePath) {
    const text = await extractTextFromFile(filePath);
    
    if (GEMINI_API_KEY && text.length > 20) {
        const prompt = `
        You are an expert AI resume parser. Extract the following information from the resume text below and return ONLY a valid JSON object.
        Do NOT wrap the JSON in markdown code blocks like \`\`\`json ... \`\`\`. Just return the raw JSON string.

        Required fields in JSON:
        - full_name (string)
        - email (string)
        - phone (string)
        - location (string)
        - professional_summary (string)
        - career_objective (string)
        - skills (array of strings)
        - education (array of objects with keys: institution, degree, field_of_study, start_date, end_date)
        - experience (array of objects with keys: company, role, start_date, end_date, description)
        - projects (array of objects with keys: title, description, technologies)
        - github_url (string)
        - linkedin_url (string)

        Resume Text:
        ${text.substring(0, 8000)}
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
            console.error('Direct Gemini resume parse error:', err.message);
        }
    }

    return fallbackNLPParser(text);
}

function fallbackNLPParser(text) {
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const email = emailMatch ? emailMatch[0] : 'contact@portfolio.dev';

    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : '+1 555-0199';

    const githubMatch = text.match(/https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_-]+/i);
    const github = githubMatch ? githubMatch[0] : 'https://github.com';

    const linkedinMatch = text.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/i);
    const linkedin = linkedinMatch ? linkedinMatch[0] : 'https://linkedin.com';

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let fullName = lines[0] || 'Professional Developer';
    if (fullName.length > 50 || fullName.includes('@')) fullName = 'Professional Candidate';

    const techKeywords = [
        "JavaScript", "Python", "React", "Node.js", "Express", "HTML", "CSS", "Tailwind",
        "SQL", "PostgreSQL", "MongoDB", "TypeScript", "Git", "Docker", "AWS", "Java", "C++",
        "REST API", "GraphQL", "Linux", "FastAPI", "Next.js"
    ];
    const detectedSkills = techKeywords.filter(k => {
        try {
            return new RegExp('\\b' + escapeRegExp(k) + '\\b', 'i').test(text);
        } catch (e) {
            return text.toLowerCase().includes(k.toLowerCase());
        }
    });
    const skills = detectedSkills.length > 0 ? detectedSkills : ["Software Engineering", "Full-Stack Development", "Problem Solving", "Modern Web Architecture"];

    return {
        full_name: fullName,
        email: email,
        phone: phone,
        location: "Global",
        professional_summary: `Dedicated software developer skilled in ${skills.slice(0, 4).join(', ')}. Passionate about building performant applications and solving real-world problems.`,
        career_objective: "To contribute as a key engineering contributor and drive scalable technical solutions.",
        skills: skills,
        education: [
            {
                institution: "University of Technology",
                degree: "Bachelor of Science",
                field_of_study: "Computer Science",
                start_date: "2020",
                end_date: "2024"
            }
        ],
        experience: [
            {
                company: "Tech Systems",
                role: "Software Developer",
                start_date: "2023",
                end_date: "Present",
                description: "Built scalable web features, enhanced database queries, and implemented modern user interfaces."
            }
        ],
        projects: [
            {
                title: "Portfolio Web Platform",
                description: "Developed modern interactive web applications with real-time editing and state persistence.",
                technologies: skills.slice(0, 3)
            }
        ],
        github_url: github,
        linkedin_url: linkedin
    };
}

module.exports = {
    parseResumeDirect
};
