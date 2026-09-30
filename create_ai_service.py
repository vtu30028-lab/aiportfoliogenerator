import os

files = {
    'ai-service/app/main.py': '''from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

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
    return {"message": "Resume analyzed"}

@app.post("/api/analyze-job")
async def analyze_job(job_description: str = Form(...)):
    return {"message": "Job analyzed"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
'''
}

for filepath, content in files.items():
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
