from pydantic import BaseModel


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    success: bool
    answer: str


class UploadResponse(BaseModel):
    success: bool
    total_chunks: int