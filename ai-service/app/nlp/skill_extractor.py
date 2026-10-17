import os
import json
import re
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

def analyze_job_with_ai(job_description, user_skills):
    # Try Gemini 3.5 Flash Lite REST API first
    if api_key and api_key != "your_gemini_api_key_here":
        prompt = f"""
        You are an expert technical recruiter and talent advisor.
        Analyze the following job description and compare it with the candidate's skills.
        
        Candidate Skills:
        {user_skills}
        
        Job Description:
        {job_description[:6000]}
        
        Return ONLY a JSON object with EXACTLY these keys:
        - matching_skills (list of strings)
        - missing_skills (list of strings)
        - suggestions (string: actionable advice on what the candidate should learn or highlight)
        Do NOT wrap in markdown codeblocks. Return valid raw JSON only.
        """

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2}
        }

        try:
            response = requests.post(url, json=payload, timeout=25)
            if response.status_code == 200:
                data = response.json()
                raw_text = data['candidates'][0]['content']['parts'][0]['text'].strip()
                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                elif raw_text.startswith("```"):
                    raw_text = raw_text[3:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]
                raw_text = raw_text.strip()
                return json.loads(raw_text)
            else:
                print(f"Gemini API returned status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"Error calling Gemini in analyze_job_with_ai: {e}")

    # Fallback rule-based matching
    user_skill_list = [s.strip().lower() for s in user_skills.split(',') if s.strip()]
    common_skills = [
        "React", "Node.js", "JavaScript", "TypeScript", "Python", "SQL", "PostgreSQL",
        "MongoDB", "AWS", "Docker", "Git", "REST APIs", "GraphQL", "Tailwind CSS",
        "HTML", "CSS", "Next.js", "Express", "Kubernetes", "Linux", "CI/CD", "Redux", "Java"
    ]
    
    job_desc_lower = job_description.lower()
    job_skills_found = [s for s in common_skills if re.search(r'\b' + re.escape(s.lower()) + r'\b', job_desc_lower)]
    
    matching = []
    missing = []
    
    for js in job_skills_found:
        if any(us in js.lower() or js.lower() in us for us in user_skill_list):
            matching.append(js)
        else:
            missing.append(js)

    if not matching and not missing:
        missing = job_skills_found[:4] or ["Relevant Technical Skills"]

    suggestion_text = f"Consider focusing on {', '.join(missing[:3]) if missing else 'expanding domain depth'} to strongly align with the job specifications."

    return {
        "matching_skills": matching,
        "missing_skills": missing,
        "suggestions": suggestion_text
    }
