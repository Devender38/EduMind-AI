import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.logger import get_logger
from app.utils.json_parser import JSONParser

logger = get_logger("FlashcardsRoute")
router = APIRouter()

rag_service = None


def init(service):
    global rag_service
    rag_service = service
    logger.info("Flashcards route initialized with RAG service")


class FlashcardRequest(BaseModel):
    document_id: str


@router.post("/flashcards")
async def generate_flashcards(request: FlashcardRequest):
    start_time = time.perf_counter()
    logger.info(f"Incoming /flashcards request for document_id='{request.document_id}'")

    try:
        raw_response = rag_service.generate_flashcards(request.document_id)
        flashcards = JSONParser.parse_list(raw_response)

        # Validate structure of each card
        valid_cards = []
        for item in flashcards:
            if isinstance(item, dict) and "question" in item and "answer" in item:
                valid_cards.append({
                    "question": str(item["question"]).strip(),
                    "answer": str(item["answer"]).strip()
                })

        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(
            f"Flashcards parsed for doc_id='{request.document_id}': {len(valid_cards)} cards in {elapsed:.2f}ms"
        )

        return {
            "success": True,
            "count": len(valid_cards),
            "flashcards": valid_cards
        }

    except Exception as e:
        logger.error(
            f"Failed generating flashcards for doc_id={request.document_id}: {e}",
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )