import pdfplumber
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def extract_text_from_pdf(file_path):
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def parse_resume_with_ai(text):
    if not api_key or api_key == "your_gemini_api_key_here":
        return mock_parsed_data()

    prompt = f"""
    You are an expert AI resume parser. Extract the following information from the resume text below and return ONLY a valid JSON object.
    Do NOT wrap the JSON in markdown code blocks like ```json ... ```. Just return the raw JSON string.

    Required fields in JSON:
    - full_name (string)
    - email (string)
    - phone (string)
    - location (string)
    - professional_summary (string)
    - career_objective (string, generate one if missing based on skills)
    - skills (list of strings)
    - education (list of objects with keys: institution, degree, field_of_study, start_date, end_date)
    - experience (list of objects with keys: company, role, start_date, end_date, description)
    - projects (list of objects with keys: title, description, technologies)
    - github_url (string)
    - linkedin_url (string)

    Resume Text:
    {text}
    """

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        # Clean up response (sometimes Gemini adds markdown blocks even when told not to)
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        return json.loads(response_text)
    except Exception as e:
        print(f"AI Extraction error: {e}")
        return mock_parsed_data()

def mock_parsed_data():
    return {
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890",
        "location": "New York, USA",
        "professional_summary": "Experienced software engineer specializing in full-stack development.",
        "career_objective": "To build scalable web applications.",
        "skills": ["JavaScript", "React", "Node.js", "Python", "SQL"],
        "education": [
            {
                "institution": "University of Tech",
                "degree": "B.S.",
                "field_of_study": "Computer Science",
                "start_date": "2018",
                "end_date": "2022"
            }
        ],
        "experience": [],
        "projects": [],
        "github_url": "https://github.com/johndoe",
        "linkedin_url": "https://linkedin.com/in/johndoe"
    }
