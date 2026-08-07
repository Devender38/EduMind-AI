import time
from typing import Union, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.logger import get_logger

logger = get_logger("NotesRoute")
router = APIRouter()

rag_service = None


def init(service):
    global rag_service
    rag_service = service
    logger.info("Notes route initialized with RAG service")


class NotesRequest(BaseModel):
    document_id: Optional[Union[str, List[str]]] = None
    note_type: str = "detailed"  # detailed, exam, revision, one_page, bullet


@router.post("/notes/generate")
async def generate_notes(request: NotesRequest):
    start_time = time.perf_counter()
    logger.info(
        f"Incoming /notes/generate request | doc_id={request.document_id} | type={request.note_type}"
    )

    try:
        notes_content = rag_service.generate_notes(
            document_id=request.document_id,
            note_type=request.note_type
        )

        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(f"Notes generation completed in {elapsed:.2f}ms")

        return {
            "success": True,
            "document_id": request.document_id,
            "note_type": request.note_type,
            "notes": notes_content
        }

    except Exception as e:
        logger.error(f"Notes generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Notes Generation Error: {str(e)}"
        )
