from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

from app.services.pdf_service import PDFService
from app.services.chunk_service import ChunkService

app = FastAPI(
    title="EduMind AI Service",
    description="AI Backend for EduMind",
    version="1.0.0"
)

# ==========================
# CORS
# ==========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# Startup
# ==========================

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ==========================
# Home
# ==========================

@app.get("/")
def home():
    return {
        "success": True,
        "service": "EduMind AI",
        "version": "1.0.0",
        "status": "Running"
    }


# ==========================
# Health
# ==========================

@app.get("/health")
def health():
    return {
        "success": True,
        "status": "Healthy"
    }


# ==========================
# Extract PDF
# ==========================

@app.post("/extract")
async def extract_pdf(file: UploadFile = File(...)):
    try:

        # Only PDF allowed
        if file.content_type != "application/pdf":
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed."
            )

        # Save uploaded file
        file_path = os.path.join(
            UPLOAD_FOLDER,
            file.filename
        )

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extract text
        extracted_text = PDFService.extract_text(file_path)

        # Split into chunks
        chunks = ChunkService.split_text(extracted_text)

        return {
            "success": True,
            "file_name": file.filename,
            "characters": len(extracted_text),
            "total_chunks": len(chunks),
            "first_chunk": chunks[0] if chunks else "",
            "preview": extracted_text[:500]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==========================
# Run
# ==========================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )