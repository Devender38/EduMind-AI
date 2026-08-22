import os
import time
import numpy as np
from app.utils.logger import get_logger

logger = get_logger("EmbeddingService")

# Global singleton model cache
_GLOBAL_MODEL = None
_BACKEND_TYPE = None  # 'fastembed', 'sentence_transformers', or 'lightweight'


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
        self.dimension = 384
        self._initialized = True
        logger.info(f"EmbeddingService initialized (lazy mode, target model={model_name})")

    def _get_model(self):
        global _GLOBAL_MODEL, _BACKEND_TYPE
        if _GLOBAL_MODEL is not None:
            return _GLOBAL_MODEL

        start_time = time.perf_counter()

        # 1. Try FastEmbed (Lightweight ONNX Runtime - ~35MB RAM, no PyTorch)
        try:
            # pyrefly: ignore [missing-import]
            from fastembed import TextEmbedding
            logger.info("Initializing FastEmbed (ONNX Runtime, ultra-low memory mode)...")
            _GLOBAL_MODEL = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
            _BACKEND_TYPE = "fastembed"
            elapsed = (time.perf_counter() - start_time) * 1000
            logger.info(f"FastEmbed engine ready in {elapsed:.2f}ms")
            return _GLOBAL_MODEL
        except Exception as e:
            logger.warn(f"FastEmbed not available ({e}), trying SentenceTransformers...")

        # 2. Try SentenceTransformers if available
        try:
            try:
                import torch
                torch.set_num_threads(1)
            except Exception:
                pass

            from sentence_transformers import SentenceTransformer
            logger.info("Initializing SentenceTransformer...")
            _GLOBAL_MODEL = SentenceTransformer(self.model_name)
            _BACKEND_TYPE = "sentence_transformers"
            elapsed = (time.perf_counter() - start_time) * 1000
            logger.info(f"SentenceTransformer engine ready in {elapsed:.2f}ms")
            return _GLOBAL_MODEL
        except Exception as e:
            logger.warn(f"SentenceTransformers not available ({e}), using lightweight embedding fallback...")

        # 3. Deterministic Lightweight Fallback (Zero dependency, < 1MB RAM)
        _BACKEND_TYPE = "lightweight"
        logger.info("Using built-in lightweight deterministic embedding generator.")
        return None

    def _lightweight_embed(self, text: str) -> np.ndarray:
        """Deterministic 384-dimensional feature embedding for ultra-low memory environments."""
        vec = np.zeros(self.dimension, dtype=np.float32)
        words = text.lower().split()
        if not words:
            return vec

        for word in words:
            # Word hash mapping
            h = hash(word) % self.dimension
            vec[h] += 1.0

            # 3-gram char hash mapping
            for i in range(len(word) - 2):
                tri = word[i : i + 3]
                th = (hash(tri) * 31) % self.dimension
                vec[th] += 0.5

        # L2 Normalize
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec /= norm
        return vec

    def create_embeddings(self, texts: list[str]) -> np.ndarray:
        if not texts:
            return np.empty((0, self.dimension), dtype=np.float32)

        start_time = time.perf_counter()
        model = self._get_model()

        if _BACKEND_TYPE == "fastembed":
            # FastEmbed returns a generator of numpy arrays
            embeddings_list = list(model.embed(texts))
            embeddings = np.array(embeddings_list, dtype=np.float32)
        elif _BACKEND_TYPE == "sentence_transformers":
            embeddings = model.encode(
                texts,
                convert_to_numpy=True,
                normalize_embeddings=True,
                batch_size=16,
                show_progress_bar=False,
            ).astype(np.float32)
        else:
            embeddings = np.array(
                [self._lightweight_embed(t) for t in texts], dtype=np.float32
            )

        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(
            f"Created {len(embeddings)} embeddings via {_BACKEND_TYPE} in {elapsed:.2f}ms"
        )
        return embeddings

    def create_query_embedding(self, query: str) -> np.ndarray:
        start_time = time.perf_counter()
        model = self._get_model()

        if _BACKEND_TYPE == "fastembed":
            query_gen = list(model.query_embed(query))
            embedding = np.array(query_gen[0], dtype=np.float32)
        elif _BACKEND_TYPE == "sentence_transformers":
            embedding = model.encode(
                query,
                convert_to_numpy=True,
                normalize_embeddings=True,
                show_progress_bar=False,
            ).astype(np.float32)
        else:
            embedding = self._lightweight_embed(query)

        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(f"Created query embedding via {_BACKEND_TYPE} in {elapsed:.2f}ms")
        return embedding

    def encode(self, text: str) -> np.ndarray:
        return self.create_query_embedding(text)