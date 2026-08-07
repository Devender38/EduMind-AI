import time
import numpy as np
from sentence_transformers import SentenceTransformer
from app.utils.logger import get_logger

logger = get_logger("EmbeddingService")

class EmbeddingService:

    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        logger.info(f"Initializing SentenceTransformer model: {model_name}")
        start_time = time.perf_counter()
        self.model = SentenceTransformer(model_name)
        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(f"SentenceTransformer model loaded in {elapsed:.2f}ms")

    def create_embeddings(self, texts: list[str]) -> np.ndarray:
        start_time = time.perf_counter()
        logger.info(f"Creating dense embeddings for {len(texts)} chunks...")

        embeddings = self.model.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True
        )

        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(
            f"Created {len(embeddings)} embeddings with dimension {embeddings.shape[1] if embeddings.ndim > 1 else 0} in {elapsed:.2f}ms"
        )

        return embeddings.astype(np.float32)

    def create_query_embedding(self, query: str) -> np.ndarray:
        start_time = time.perf_counter()
        logger.info(f"Creating query embedding for: '{query[:80]}...'")

        embedding = self.model.encode(
            query,
            convert_to_numpy=True,
            normalize_embeddings=True
        )

        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(f"Created query embedding in {elapsed:.2f}ms")

        return embedding.astype(np.float32)

    def encode(self, text: str) -> np.ndarray:
        return self.create_query_embedding(text)