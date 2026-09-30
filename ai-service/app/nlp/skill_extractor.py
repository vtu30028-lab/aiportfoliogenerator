import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)

def analyze_job_with_ai(job_description, user_skills):
    if not api_key or api_key == "your_gemini_api_key_here":
        return {
            "matching_skills": ["React", "JavaScript"],
            "missing_skills": ["TypeScript", "AWS"],
            "suggestions": "Learn TypeScript to improve type safety."
        }
        
    prompt = f"""
    Analyze the following job description and compare it with the user's skills.
    User Skills: {user_skills}
    
    Job Description:
    {job_description}
    
    Return ONLY a JSON object with:
    - matching_skills (list of strings)
    - missing_skills (list of strings)
    - suggestions (string, advice on what to learn)
    """

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        return json.loads(response_text)
    except Exception as e:
        print(f"AI Extraction error: {e}")
        return {}
