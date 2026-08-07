import time
from typing import Union, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.logger import get_logger

logger = get_logger("SearchRoute")
router = APIRouter()

rag_service = None


def init(service):
    global rag_service
    rag_service = service
    logger.info("Search route initialized with RAG service")


class SemanticSearchRequest(BaseModel):
    query: str
    document_id: Optional[Union[str, List[str]]] = None
    k: int = 5


@router.post("/search/semantic")
async def semantic_search(request: SemanticSearchRequest):
    start_time = time.perf_counter()
    logger.info(
        f"Incoming /search/semantic request | query='{request.query[:80]}' | doc_id={request.document_id}"
    )

    try:
        results = rag_service.semantic_search(
            query=request.query,
            document_id=request.document_id,
            k=request.k
        )

        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(f"Semantic search completed in {elapsed:.2f}ms | Matches: {len(results)}")

        return {
            "success": True,
            "query": request.query,
            "results": results
        }

    except Exception as e:
        logger.error(f"Semantic search failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Semantic Search Error: {str(e)}"
        )
