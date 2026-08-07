import time
import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.logger import get_logger

logger = get_logger("SummaryRoute")
router = APIRouter()

rag_service = None


def init(service):
    global rag_service
    rag_service = service
    logger.info("Summary route initialized with RAG service")


class SummaryRequest(BaseModel):
    document_id: str


@router.post("/summary")
async def generate_summary(request: SummaryRequest):
    start_time = time.perf_counter()
    logger.info(f"Incoming /summary request for document_id='{request.document_id}'")

    try:
        summary = rag_service.generate_summary(request.document_id)
        context = rag_service.get_document_context(request.document_id)

        # Extract keywords from bold text or headings in markdown
        bold_terms = re.findall(r"\*\*([^*]+)\*\*", summary)
        heading_terms = re.findall(r"###\s+[^\w]*([^\n]+)", summary)
        
        extracted_keywords = []
        for term in heading_terms + bold_terms:
            cleaned = re.sub(r"^[^\w]+", "", term).strip()
            if len(cleaned) > 2 and len(cleaned) < 35 and cleaned not in extracted_keywords:
                extracted_keywords.append(cleaned)
                if len(extracted_keywords) >= 8:
                    break

        page_count = max(1, len(context) // 3000)
        chunk_count = len(context.split("\n\n"))
        word_count = len(summary.split())
        reading_time = max(1, word_count // 200)

        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(
            f"Summary completed for doc_id='{request.document_id}' in {elapsed:.2f}ms ({word_count} words, ~{reading_time} min read)"
        )

        return {
            "success": True,
            "summary": summary,
            "keywords": extracted_keywords,
            "reading_time": reading_time,
            "page_count": page_count,
            "chunk_count": chunk_count
        }

    except Exception as e:
        logger.error(
            f"Failed generating summary for doc_id={request.document_id}: {e}",
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )