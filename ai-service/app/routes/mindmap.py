import time
from typing import Union, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.logger import get_logger

logger = get_logger("MindMapRoute")
router = APIRouter()

rag_service = None


def init(service):
    global rag_service
    rag_service = service
    logger.info("MindMap route initialized with RAG service")


class MindMapRequest(BaseModel):
    document_id: Optional[Union[str, List[str]]] = None


@router.post("/mindmap/generate")
async def generate_mindmap(request: MindMapRequest):
    start_time = time.perf_counter()
    logger.info(f"Incoming /mindmap/generate request | doc_id={request.document_id}")

    try:
        tree = rag_service.generate_mindmap(document_id=request.document_id)
        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(f"MindMap generation completed in {elapsed:.2f}ms")

        return {
            "success": True,
            "document_id": request.document_id,
            "mindmap": tree
        }

    except Exception as e:
        logger.error(f"MindMap generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"MindMap Generation Error: {str(e)}"
        )
