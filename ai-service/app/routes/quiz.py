import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.logger import get_logger
from app.utils.json_parser import JSONParser

logger = get_logger("QuizRoute")
router = APIRouter()

rag_service = None


def init(service):
    global rag_service
    rag_service = service
    logger.info("Quiz route initialized with RAG service")


class QuizRequest(BaseModel):
    document_id: str


@router.post("/quiz")
async def generate_quiz(request: QuizRequest):
    start_time = time.perf_counter()
    logger.info(f"Incoming /quiz request for document_id='{request.document_id}'")

    try:
        raw_response = rag_service.generate_quiz(request.document_id)
        quiz = JSONParser.parse_list(raw_response)

        # Validate structure of each question
        valid_quiz = []
        for item in quiz:
            if (
                isinstance(item, dict)
                and "question" in item
                and "options" in item
                and isinstance(item["options"], list)
                and "answer" in item
            ):
                valid_quiz.append({
                    "question": str(item["question"]).strip(),
                    "options": [str(opt).strip() for opt in item["options"]],
                    "answer": str(item["answer"]).strip()
                })

        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(
            f"Quiz parsed for doc_id='{request.document_id}': {len(valid_quiz)} questions in {elapsed:.2f}ms"
        )

        return {
            "success": True,
            "count": len(valid_quiz),
            "quiz": valid_quiz
        }

    except Exception as e:
        logger.error(
            f"Failed generating quiz for doc_id={request.document_id}: {e}",
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )