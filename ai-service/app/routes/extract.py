import tempfile
import time
import requests
import fitz  # PyMuPDF
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.pdf_service import PDFService
from app.services.chunk_service import ChunkService
from services.ai_service import AIService
from app.utils.logger import get_logger

logger = get_logger("ExtractRoute")
router = APIRouter()
vector_store = None


def init(store):
    global vector_store
    vector_store = store
    logger.info("Extract route initialized with vector store")


class ExtractRequest(BaseModel):
    pdf_url: str
    document_id: str


@router.post("/extract-url")
async def extract_pdf(request: ExtractRequest):
    start_time = time.perf_counter()
    logger.info(
        f"Incoming /extract-url request for document_id='{request.document_id}' | URL: {request.pdf_url}"
    )

    try:
        logger.info(f"Downloading PDF from {request.pdf_url}...")
        download_start = time.perf_counter()
        response = requests.get(request.pdf_url, timeout=60)
        response.raise_for_status()
        download_ms = (time.perf_counter() - download_start) * 1000
        logger.info(
            f"PDF downloaded ({len(response.content)} bytes) in {download_ms:.2f}ms"
        )

        with tempfile.NamedTemporaryFile(
            suffix=".pdf",
            delete=False
        ) as temp:
            temp.write(response.content)
            pdf_path = temp.name

        # Page Count
        pdf = fitz.open(pdf_path)
        page_count = len(pdf)
        pdf.close()

        # Text extraction
        text = PDFService.extract_text(pdf_path)
        if not text.strip():
            logger.error(f"No extractable text found inside PDF for document_id={request.document_id}")
            raise Exception("No text found inside PDF.")

        # Chunking
        chunks = ChunkService.chunk_text(text)

        # Embeddings
        embeddings = vector_store.embedding_service.create_embeddings(chunks)

        # Indexing
        vector_store.add_documents(
            chunks=chunks,
            embeddings=embeddings,
            document_id=request.document_id
        )

        # AI Summary
        logger.info("Generating AI initial summary and keywords...")
        summary_data = AIService.generate_summary(text)

        # Reading Time
        words = len(text.split())
        reading_time = max(1, round(words / 200))

        total_elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(
            f"Document {request.document_id} processed & indexed successfully in {total_elapsed:.2f}ms "
            f"({page_count} pages, {len(chunks)} chunks, ~{reading_time} min read)"
        )

        return {
            "success": True,
            "message": "PDF indexed successfully.",
            "summary": summary_data.get("summary", ""),
            "keywords": summary_data.get("keywords", []),
            "pageCount": page_count,
            "chunkCount": len(chunks),
            "readingTime": reading_time
        }

    except Exception as e:
        logger.error(
            f"Failed to process and index PDF for document_id={request.document_id}: {e}",
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )