import time
from typing import Union, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.logger import get_logger

logger = get_logger("ChatRoute")
router = APIRouter()

rag_service = None


def init(service):
    global rag_service
    rag_service = service
    logger.info("Chat route initialized with RAG service")


class ChatRequest(BaseModel):
    question: str
    document_id: Optional[Union[str, List[str]]] = None


@router.post("/chat")
async def chat(request: ChatRequest):
    start_time = time.perf_counter()
    logger.info(
        f"Incoming /chat request | doc_id={request.document_id} | question='{request.question[:100]}'"
    )

    try:
        answer = rag_service.ask(
            request.question,
            request.document_id
        )

        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(
            f"Chat request completed in {elapsed:.2f}ms | Sources retrieved: {len(answer.get('sources', []))}"
        )

        return answer

    except Exception as e:
        logger.error(f"Chat request failed for doc_id={request.document_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal AI Error: {str(e)}"
        )