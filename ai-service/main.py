import os
import shutil
import time
import requests
from tempfile import NamedTemporaryFile
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.utils.logger import get_logger
from app.services.pdf_service import PDFService
from app.services.chunk_service import ChunkService
from app.services.embedding_service import EmbeddingService
from app.services.vector_store import VectorStore
from app.services.rag_service import RAGService

# Route Imports
from app.routes.chat import router as chat_router, init as init_chat
from app.routes.summary import router as summary_router, init as init_summary
from app.routes.flashcards import router as flashcards_router, init as init_flashcards
from app.routes.quiz import router as quiz_router, init as init_quiz
from app.routes.extract import router as extract_router, init as init_extract
from app.routes.planner import router as planner_router, init as init_planner
from app.routes.notes import router as notes_router, init as init_notes
from app.routes.mindmap import router as mindmap_router, init as init_mindmap
from app.routes.search import router as search_router, init as init_search

logger = get_logger("EduMindAPI")

# =====================================================
# FastAPI Application
# =====================================================

app = FastAPI(
    title="EduMind AI Service",
    description="AI RAG Backend for EduMind SaaS",
    version="2.5.0"
)

# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# Request Logging Middleware
# =====================================================

@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    start_time = time.perf_counter()
    client_ip = request.client.host if request.client else "unknown"
    method = request.method
    path = request.url.path

    logger.info(f"--> [HTTP IN] {method} {path} | Client: {client_ip}")

    try:
        response = await call_next(request)
        process_time_ms = (time.perf_counter() - start_time) * 1000
        response.headers["X-Process-Time-Ms"] = f"{process_time_ms:.2f}"

        logger.info(
            f"<-- [HTTP OUT] {method} {path} | Status: {response.status_code} | Duration: {process_time_ms:.2f}ms"
        )
        return response
    except Exception as e:
        process_time_ms = (time.perf_counter() - start_time) * 1000
        logger.error(
            f"<-- [HTTP ERROR] {method} {path} | Error: {e} | Duration: {process_time_ms:.2f}ms",
            exc_info=True
        )
        raise

# =====================================================
# Upload Folder
# =====================================================

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# =====================================================
# Global Services
# =====================================================

embedding_service = None
vector_store = None
rag_service = None

# =====================================================
# Lifespan / Startup & Shutdown Events
# =====================================================

@app.on_event("startup")
async def startup():
    global embedding_service
    global vector_store
    global rag_service

    logger.info("Initializing EduMind AI Service components...")

    embedding_service = EmbeddingService()
    vector_store = VectorStore()
    rag_service = RAGService(vector_store)

    # Initialize sub-routes
    init_chat(rag_service)
    init_summary(rag_service)
    init_flashcards(rag_service)
    init_quiz(rag_service)
    init_extract(vector_store)
    init_planner(rag_service)
    init_notes(rag_service)
    init_mindmap(rag_service)
    init_search(rag_service)

    logger.info("EduMind AI Service is fully initialized and ready.")


@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down EduMind AI Service...")
    if vector_store:
        vector_store.save()
    logger.info("EduMind AI Service shut down cleanly.")

# =====================================================
# Request Models
# =====================================================

class PDFUrlRequest(BaseModel):
    pdf_url: str
    document_id: str = "default"

# =====================================================
# Root & Health Endpoints
# =====================================================

@app.get("/")
def home():
    return {
        "success": True,
        "service": "EduMind AI",
        "status": "Running",
        "version": "2.5.0"
    }


@app.get("/health")
def health():
    return {
        "success": True,
        "status": "Healthy"
    }

# =====================================================
# Upload PDF (Direct File)
# =====================================================

@app.post("/extract")
async def extract_pdf(file: UploadFile = File(...)):
    start_time = time.perf_counter()
    logger.info(f"Direct file upload received: {file.filename} ({file.content_type})")

    try:
        if file.content_type != "application/pdf":
            logger.warning(f"Rejected non-PDF file: {file.filename}")
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed."
            )

        file_path = os.path.join(UPLOAD_FOLDER, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        text = PDFService.extract_text(file_path)
        chunks = ChunkService.split_text(text)
        embeddings = embedding_service.create_embeddings(chunks)

        vector_store.add_documents(
            chunks=chunks,
            embeddings=embeddings,
            document_id=file.filename
        )

        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(f"Direct file {file.filename} indexed successfully in {elapsed:.2f}ms")

        return {
            "success": True,
            "message": "PDF Indexed Successfully",
            "file_name": file.filename,
            "characters": len(text),
            "chunks": len(chunks),
            "vectors": vector_store.total_documents()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed extracting PDF file {file.filename}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# =====================================================
# Clear Vector Store
# =====================================================

@app.delete("/clear")
def clear():
    logger.info("Clear request received. Resetting vector store...")
    vector_store.clear()
    return {
        "success": True,
        "message": "Vector Store Cleared"
    }

# =====================================================
# Stats Endpoint
# =====================================================

@app.get("/stats")
def stats():
    total = vector_store.total_documents() if vector_store else 0
    return {
        "success": True,
        "total_vectors": total
    }

# =====================================================
# Register Routers
# =====================================================

app.include_router(chat_router)
app.include_router(summary_router)
app.include_router(flashcards_router)
app.include_router(quiz_router)
app.include_router(extract_router)
app.include_router(planner_router)
app.include_router(notes_router)
app.include_router(mindmap_router)
app.include_router(search_router)

# =====================================================
# Entrypoint
# =====================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )