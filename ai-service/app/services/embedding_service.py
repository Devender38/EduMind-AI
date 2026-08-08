import os
import time
import numpy as np
from app.utils.logger import get_logger

logger = get_logger("EmbeddingService")

# Global singleton model cache
_GLOBAL_MODEL = None


class EmbeddingService:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        if getattr(self, "_initialized", False):
            return

        self.model_name = model_name
        self._initialized = True
        logger.info(f"EmbeddingService initialized (lazy mode, model={model_name})")

    def _get_model(self):
        global _GLOBAL_MODEL
        if _GLOBAL_MODEL is None:
            logger.info(f"Loading SentenceTransformer model into memory: {self.model_name}...")
            start_time = time.perf_counter()

            # Set PyTorch thread limit to 1 to reduce memory & CPU consumption on cloud free tier
            try:
                import torch
                torch.set_num_threads(1)
            except Exception:
                pass

            from sentence_transformers import SentenceTransformer
            _GLOBAL_MODEL = SentenceTransformer(self.model_name)

            elapsed = (time.perf_counter() - start_time) * 1000
            logger.info(f"SentenceTransformer model loaded successfully in {elapsed:.2f}ms")

        return _GLOBAL_MODEL

    def create_embeddings(self, texts: list[str]) -> np.ndarray:
        if not texts:
            return np.empty((0, 384), dtype=np.float32)

        start_time = time.perf_counter()
        logger.info(f"Creating dense embeddings for {len(texts)} chunks...")

        model = self._get_model()
        embeddings = model.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True,
            batch_size=16,
            show_progress_bar=False
        )

        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(
            f"Created {len(embeddings)} embeddings in {elapsed:.2f}ms"
        )

        return embeddings.astype(np.float32)

    def create_query_embedding(self, query: str) -> np.ndarray:
        start_time = time.perf_counter()
        logger.info(f"Creating query embedding for: '{query[:80]}...'")

        model = self._get_model()
        embedding = model.encode(
            query,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False
        )

        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(f"Created query embedding in {elapsed:.2f}ms")

        return embedding.astype(np.float32)

    def encode(self, text: str) -> np.ndarray:
        return self.create_query_embedding(text)