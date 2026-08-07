import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.logger import get_logger

logger = get_logger("PlannerRoute")
router = APIRouter()

rag_service = None


def init(service):
    global rag_service
    rag_service = service
    logger.info("Planner route initialized with RAG service")


class PlanRequest(BaseModel):
    document_id: str
    plan_type: str = "weekly"  # "weekly" | "monthly" | "cram_1day"


@router.post("/planner")
async def generate_plan(request: PlanRequest):
    start_time = time.perf_counter()
    logger.info(
        f"Incoming /planner request for doc_id='{request.document_id}' (type={request.plan_type})"
    )

    try:
        plan_text = rag_service.generate_study_plan(
            document_id=request.document_id,
            plan_type=request.plan_type
        )

        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(
            f"Study plan ({request.plan_type}) generated for doc_id='{request.document_id}' in {elapsed:.2f}ms"
        )

        return {
            "success": True,
            "document_id": request.document_id,
            "plan_type": request.plan_type,
            "plan": plan_text,
        }

    except Exception as e:
        logger.error(
            f"Failed generating study plan for doc_id={request.document_id}: {e}",
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
