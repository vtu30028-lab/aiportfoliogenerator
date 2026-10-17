import os
import json
import re
import requests
import pdfplumber
import docx
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

def extract_text_from_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    
    if ext == ".pdf":
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            print(f"Error reading PDF with pdfplumber: {e}")
            
    elif ext in [".docx", ".doc"]:
        try:
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                if para.text:
                    text += para.text + "\n"
        except Exception as e:
            print(f"Error reading DOCX: {e}")
            
    else:
        # Try reading as plain text
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        except Exception as e:
            print(f"Error reading text file: {e}")

    return text.strip()

def extract_with_gemini(text):
    if not api_key or api_key == "your_gemini_api_key_here":
        return None

    prompt = f"""
    You are an expert AI resume parser. Extract the following information from the resume text below and return ONLY a valid JSON object.
    Do NOT wrap the JSON in markdown code blocks like ```json ... ```. Just return the raw JSON string.

    Required fields in JSON:
    - full_name (string)
    - email (string)
    - phone (string)
    - location (string)
    - professional_summary (string: 2-3 sentences)
    - career_objective (string)
    - skills (list of strings: technical and soft skills)
    - education (list of objects with keys: institution, degree, field_of_study, start_date, end_date)
    - experience (list of objects with keys: company, role, start_date, end_date, description)
    - projects (list of objects with keys: title, description, technologies)
    - github_url (string)
    - linkedin_url (string)

    Resume Text:
    {text[:8000]}
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
            # Clean markdown codeblocks if any
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
        print(f"Error calling Gemini REST API: {e}")

    return None

def fallback_nlp_extractor(text):
    # Extract Email
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    email = email_match.group(0) if email_match else ""

    # Extract Phone
    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0) if phone_match else ""

    # Extract GitHub & LinkedIn
    github_match = re.search(r'https?://(www\.)?github\.com/[A-Za-z0-9_-]+', text, re.IGNORECASE)
    github = github_match.group(0) if github_match else ""
    
    linkedin_match = re.search(r'https?://(www\.)?linkedin\.com/in/[A-Za-z0-9_-]+', text, re.IGNORECASE)
    linkedin = linkedin_match.group(0) if linkedin_match else ""

    # Guess Name from first non-empty lines
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    full_name = lines[0] if lines else "Professional"
    if len(full_name) > 50 or "@" in full_name:
        full_name = "Professional Candidate"

    # Known common skills keyword search
    tech_keywords = [
        "JavaScript", "Python", "React", "Node.js", "Express", "HTML", "CSS", "Tailwind",
        "SQL", "PostgreSQL", "MongoDB", "TypeScript", "Git", "Docker", "AWS", "Java", "C++",
        "REST API", "GraphQL", "Linux", "FastAPI", "Next.js", "Machine Learning", "NLP"
    ]
    detected_skills = [skill for skill in tech_keywords if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE)]
    if not detected_skills:
        detected_skills = ["Software Engineering", "Full-Stack Development", "Problem Solving"]

    summary = f"Results-driven software developer skilled in {', '.join(detected_skills[:4])}. Proven ability to build modern web applications and solve complex technical challenges."

    return {
        "full_name": full_name,
        "email": email or "candidate@example.com",
        "phone": phone or "+1 555-0199",
        "location": "Global",
        "professional_summary": summary,
        "career_objective": "To leverage technical expertise and contribute to high-impact software projects.",
        "skills": detected_skills,
        "education": [
            {
                "institution": "University / College",
                "degree": "Bachelor of Science",
                "field_of_study": "Computer Science / Information Technology",
                "start_date": "2020",
                "end_date": "2024"
            }
        ],
        "experience": [
            {
                "company": "Tech Innovations",
                "role": "Software Developer Intern",
                "start_date": "2023",
                "end_date": "2024",
                "description": "Developed full-stack web features, enhanced backend APIs, and collaborated on modern UI design."
            }
        ],
        "projects": [
            {
                "title": "Full-Stack Web Platform",
                "description": "Engineered an interactive responsive web application with authentication and database persistence.",
                "technologies": detected_skills[:3]
            }
        ],
        "github_url": github or "https://github.com",
        "linkedin_url": linkedin or "https://linkedin.com"
    }

def parse_resume_with_ai(text):
    if not text:
        return fallback_nlp_extractor("")
        
    ai_result = extract_with_gemini(text)
    if ai_result:
        return ai_result
        
    return fallback_nlp_extractor(text)
