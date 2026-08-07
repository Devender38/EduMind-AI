import time
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.utils.logger import get_logger

logger = get_logger("ChunkService")

class ChunkService:

    @staticmethod
    def split_text(text: str) -> list[str]:
        start_time = time.perf_counter()
        logger.info(f"Chunking text of length {len(text)} chars ({len(text.split())} words)...")

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=100,
            separators=[
                "\n\n",
                "\n",
                ". ",
                " ",
                ""
            ]
        )

        chunks = splitter.split_text(text)
        elapsed = (time.perf_counter() - start_time) * 1000

        avg_size = (sum(len(c) for c in chunks) / len(chunks)) if chunks else 0
        logger.info(
            f"Generated {len(chunks)} chunks (avg {avg_size:.1f} chars/chunk) in {elapsed:.2f}ms"
        )

        return chunks

    @staticmethod
    def chunk_text(text: str) -> list[str]:
        return ChunkService.split_text(text)