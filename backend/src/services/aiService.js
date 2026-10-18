const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function callGemini(prompt) {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured in backend/.env');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
    const response = await axios.post(url, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 }
    }, { timeout: 30000 });

    if (response.data && response.data.candidates && response.data.candidates[0]) {
        let raw = response.data.candidates[0].content.parts[0].text.trim();
        if (raw.startsWith('```json')) raw = raw.slice(7);
        else if (raw.startsWith('```')) raw = raw.slice(3);
        if (raw.endsWith('```')) raw = raw.slice(0, -3);
        return raw.trim();
    }
    throw new Error('No candidate content returned from Gemini');
}

// 1. Generate Complete Portfolio from Raw User Details
async function generatePortfolioFromDetails(details) {
    const prompt = `
    You are an expert AI Portfolio Designer and Senior Career Consultant.
    The user is providing their raw personal details. Generate a complete, polished, high-impact professional portfolio structure.

    Raw Details:
    - Full Name: ${details.full_name || 'Professional Developer'}
    - Target Role / Title: ${details.role || 'Full-Stack Software Engineer'}
    - Core Skills: ${details.skills || 'JavaScript, React, Node.js, SQL, Web Development'}
    - Experience Notes: ${details.experience_notes || 'Built web applications and worked on team software projects'}
    - Project Notes: ${details.project_notes || 'Interactive web platforms, API development, responsive user interfaces'}
    - Education Notes: ${details.education_notes || 'Degree in Computer Science or related technical discipline'}
    - Location: ${details.location || 'Global / Remote'}
    - Email: ${details.email || 'developer@example.com'}
    - Phone: ${details.phone || '+1 555-0199'}

    Return ONLY a valid JSON object (no markdown, no backticks) with EXACTLY these keys:
    {
      "full_name": "${details.full_name || 'Professional Developer'}",
      "role": "Polished professional headline",
      "email": "${details.email || 'developer@example.com'}",
      "phone": "${details.phone || '+1 555-0199'}",
      "location": "${details.location || 'Global / Remote'}",
      "professional_summary": "A 2-3 sentence compelling, executive-level summary showcasing strengths, impact, and passion",
      "career_objective": "A focused 1-2 sentence career aspiration statement aligned with their role",
      "skills": ["Array of 8-12 relevant technical, framework, database, and soft skills"],
      "skills_categorized": {
        "technical": ["React", "Node.js", "Python", ...],
        "tools_cloud": ["Git", "Docker", "PostgreSQL", ...],
        "soft_skills": ["Problem Solving", "System Architecture", "Collaboration"]
      },
      "experience": [
        {
          "company": "Company / Organization name",
          "role": "Role title",
          "start_date": "2023",
          "end_date": "Present",
          "description": "2-3 sentences of clear accomplishments and technical responsibilities"
        }
      ],
      "projects": [
        {
          "title": "Project Title",
          "description": "Engaging description describing what was built, the problem it solved, and the engineering impact",
          "technologies": ["React", "Node.js", "Tailwind CSS"],
          "link": "https://github.com"
        },
        {
          "title": "Second Project Title",
          "description": "Detailed description of a second impressive project",
          "technologies": ["Python", "FastAPI", "PostgreSQL"],
          "link": "https://github.com"
        }
      ],
      "education": [
        {
          "institution": "University / College Name",
          "degree": "Bachelor of Science",
          "field_of_study": "Computer Science / Software Engineering",
          "start_date": "2020",
          "end_date": "2024"
        }
      ],
      "github_url": "${details.github_url || 'https://github.com'}",
      "linkedin_url": "${details.linkedin_url || 'https://linkedin.com'}"
    }
    `;

    try {
        const jsonText = await callGemini(prompt);
        return JSON.parse(jsonText);
    } catch (err) {
        console.error('Error generating portfolio from details:', err.message);
        // Fallback structured generation
        const skillArr = (details.skills || 'JavaScript, React, Node.js, PostgreSQL')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

        return {
            full_name: details.full_name || 'Professional Developer',
            role: details.role || 'Full-Stack Software Engineer',
            email: details.email || 'developer@example.com',
            phone: details.phone || '+1 555-0199',
            location: details.location || 'Global / Remote',
            professional_summary: `Results-driven ${details.role || 'software engineer'} with deep expertise in ${skillArr.slice(0, 3).join(', ')}. Passionate about building robust web applications and solving real-world challenges.`,
            career_objective: `To leverage modern engineering practices and contribute to innovative scalable technology products.`,
            skills: skillArr.length > 0 ? skillArr : ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Git', 'Problem Solving'],
            skills_categorized: {
                technical: skillArr.slice(0, 5),
                tools_cloud: ['Git', 'PostgreSQL', 'REST APIs'],
                soft_skills: ['Analytical Thinking', 'Team Collaboration']
            },
            experience: [
                {
                    company: details.experience_notes || 'Tech Solutions Inc.',
                    role: details.role || 'Software Developer',
                    start_date: '2023',
                    end_date: 'Present',
                    description: 'Designed and deployed responsive web services, optimized database queries, and collaborated with cross-functional product teams.'
                }
            ],
            projects: [
                {
                    title: 'Scalable Web Application',
                    description: details.project_notes || 'Architected a full-featured web platform featuring authentication, database persistence, and a modern responsive interface.',
                    technologies: skillArr.slice(0, 3),
                    link: 'https://github.com'
                }
            ],
            education: [
                {
                    institution: details.education_notes || 'University of Technology',
                    degree: 'Bachelor of Science',
                    field_of_study: 'Computer Science',
                    start_date: '2020',
                    end_date: '2024'
                }
            ],
            github_url: details.github_url || 'https://github.com',
            linkedin_url: details.linkedin_url || 'https://linkedin.com'
        };
    }
}

// 2. Enhance / Rewrite Content (Summary, About Me, Tone, Grammar)
async function enhanceContent(text, type = 'summary', role = '') {
    const prompt = `
    You are a professional tech resume and portfolio copywriter.
    Enhance the following text according to type: "${type}".
    Target Role: "${role || 'Software Engineer'}"

    Original Text:
    """
    ${text}
    """

    Instructions:
    - If type is "summary" or "about": Write a compelling, concise 2-3 sentence executive-level professional summary.
    - If type is "grammar": Fix all grammar, spelling, punctuation and enhance the vocabulary to sound polished and authoritative.
    - If type is "project": Rewrite the project description to clearly highlight problem, solution, technologies, and tangible results.
    - Return ONLY the enhanced text string. No quotes, no markdown wrappers, no introductory comments.
    `;

    try {
        const enhanced = await callGemini(prompt);
        return enhanced.replace(/^["']|["']$/g, '').trim();
    } catch (err) {
        console.error('Enhance content error:', err.message);
        return text;
    }
}

// 3. Job Skill Analyzer
async function directAnalyzeJob(jobDescription, userSkills) {
    if (!GEMINI_API_KEY) {
        return fallbackRuleBasedJobAnalysis(jobDescription, userSkills);
    }

    const prompt = `
    You are an expert technical recruiter and talent advisor.
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
        const jsonText = await callGemini(prompt);
        return JSON.parse(jsonText);
    } catch (err) {
        console.error('Direct Gemini job analysis error:', err.message);
        return fallbackRuleBasedJobAnalysis(jobDescription, userSkills);
    }
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
    generatePortfolioFromDetails,
    enhanceContent,
    directAnalyzeJob,
    fallbackRuleBasedJobAnalysis
};
