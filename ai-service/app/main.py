from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import tempfile
from app.nlp.resume_extractor import extract_text_from_pdf, parse_resume_with_ai
from app.nlp.skill_extractor import analyze_job_with_ai

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Portfolio Generator Service"}

@app.post("/api/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        text = extract_text_from_pdf(tmp_path)
        parsed_data = parse_resume_with_ai(text)
        return {"message": "Resume analyzed successfully", "data": parsed_data}
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.post("/api/analyze-job")
async def analyze_job(job_description: str = Form(...), user_skills: str = Form(default="")):
    analysis = analyze_job_with_ai(job_description, user_skills)
    return {"message": "Job analyzed", "data": analysis}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
