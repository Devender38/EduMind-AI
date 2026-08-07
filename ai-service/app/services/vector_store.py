import os
import pickle
import time
import faiss
import numpy as np

from app.services.embedding_service import EmbeddingService
from app.utils.logger import get_logger

logger = get_logger("VectorStore")


class VectorStore:

    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.storage_dir = "storage"
        self.index_path = os.path.join(self.storage_dir, "faiss.index")
        self.meta_path = os.path.join(self.storage_dir, "metadata.pkl")

        os.makedirs(self.storage_dir, exist_ok=True)

        self.embedding_service = EmbeddingService()
        self.index = None
        self.chunks = []
        self.metadata = []

        self._load()

    # ----------------------------------------
    # Load Existing Database
    # ----------------------------------------

    def _load(self):
        try:
            if (
                os.path.exists(self.index_path)
                and os.path.exists(self.meta_path)
                and os.path.getsize(self.index_path) > 0
                and os.path.getsize(self.meta_path) > 0
            ):
                logger.info(f"Loading FAISS index from {self.index_path}...")
                self.index = faiss.read_index(self.index_path)

                with open(self.meta_path, "rb") as f:
                    data = pickle.load(f)

                if isinstance(data, dict):
                    self.chunks = data.get("chunks", [])
                    self.metadata = data.get("metadata", [])
                else:
                    self.chunks = data
                    self.metadata = [{} for _ in self.chunks]

                logger.info(
                    f"Successfully loaded {len(self.chunks)} chunks (FAISS total: {self.index.ntotal})"
                )
            else:
                self._create_new_index()

        except Exception as e:
            logger.warning(f"Vector DB load failed or corrupted ({e}). Initializing new index.")
            self._create_new_index()

    # ----------------------------------------
    # New Database
    # ----------------------------------------

    def _create_new_index(self):
        logger.info(f"Creating new FAISS IndexFlatL2 with dimension {self.dimension}")
        self.index = faiss.IndexFlatL2(self.dimension)
        self.chunks = []
        self.metadata = []

    # ----------------------------------------
    # Save
    # ----------------------------------------

    def save(self):
        try:
            faiss.write_index(self.index, self.index_path)
            with open(self.meta_path, "wb") as f:
                pickle.dump(
                    {
                        "chunks": self.chunks,
                        "metadata": self.metadata,
                    },
                    f
                )
            logger.info(f"Saved FAISS index ({self.index.ntotal} vectors) to disk")
        except Exception as e:
            logger.error(f"Failed to persist FAISS index: {e}", exc_info=True)

    # ----------------------------------------
    # Add Documents
    # ----------------------------------------

    def add_documents(
        self,
        chunks: list[str],
        embeddings: np.ndarray,
        document_id: str,
        page_numbers: list[int] | None = None
    ):
        if len(chunks) == 0:
            logger.warning(f"add_documents called with empty chunks for doc {document_id}")
            return

        start_time = time.perf_counter()
        embeddings = np.asarray(embeddings, dtype=np.float32)

        if embeddings.ndim == 1:
            embeddings = embeddings.reshape(1, -1)

        self.index.add(embeddings)
        self.chunks.extend(chunks)

        if page_numbers and len(page_numbers) == len(chunks):
            self.metadata.extend(
                [{"document_id": str(document_id), "page": page_numbers[i]} for i in range(len(chunks))]
            )
        else:
            self.metadata.extend(
                [{"document_id": str(document_id), "page": i + 1} for i in range(len(chunks))]
            )

        self.save()
        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(
            f"Indexed {len(chunks)} chunks for document_id='{document_id}' (Total vectors: {self.index.ntotal}) in {elapsed:.2f}ms"
        )

    # ----------------------------------------
    # Search (Single or Multi Document)
    # ----------------------------------------

    def search(
        self,
        question: str,
        document_id: str | list[str] | None = None,
        k: int = 4
    ) -> list[str]:
        if self.index is None or self.index.ntotal == 0:
            logger.warning("Search attempted on empty or uninitialized FAISS index")
            return []

        start_time = time.perf_counter()
        allowed_ids = set()
        if isinstance(document_id, list):
            allowed_ids = {str(d) for d in document_id if d}
        elif document_id:
            allowed_ids = {str(document_id)}

        logger.info(
            f"Executing semantic search for query='{question[:80]}' (allowed_ids={allowed_ids}, k={k})"
        )

        query_embedding = self.embedding_service.create_query_embedding(question)
        query_embedding = np.asarray(query_embedding, dtype=np.float32)

        if query_embedding.ndim == 1:
            query_embedding = query_embedding.reshape(1, -1)

        search_k = min(self.index.ntotal, max(50, k * 6))
        distances, indices = self.index.search(query_embedding, search_k)

        results = []
        for rank, idx in enumerate(indices[0]):
            if idx == -1 or idx >= len(self.chunks):
                continue

            if allowed_ids:
                meta = self.metadata[idx]
                if meta.get("document_id") not in allowed_ids:
                    continue

            results.append(self.chunks[idx])
            if len(results) >= k:
                break

        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(
            f"Search complete: found {len(results)} relevant chunks in {elapsed:.2f}ms"
        )
        return results

    # ----------------------------------------
    # Semantic Search with Confidence Scores & Page Citations
    # ----------------------------------------

    def search_with_scores(
        self,
        question: str,
        document_id: str | list[str] | None = None,
        k: int = 5
    ) -> list[dict]:
        if self.index is None or self.index.ntotal == 0:
            return []

        allowed_ids = set()
        if isinstance(document_id, list):
            allowed_ids = {str(d) for d in document_id if d}
        elif document_id:
            allowed_ids = {str(document_id)}

        query_embedding = self.embedding_service.create_query_embedding(question)
        query_embedding = np.asarray(query_embedding, dtype=np.float32)
        if query_embedding.ndim == 1:
            query_embedding = query_embedding.reshape(1, -1)

        search_k = min(self.index.ntotal, max(50, k * 6))
        distances, indices = self.index.search(query_embedding, search_k)

        results = []
        for rank, (dist, idx) in enumerate(zip(distances[0], indices[0])):
            if idx == -1 or idx >= len(self.chunks):
                continue

            meta = self.metadata[idx] if idx < len(self.metadata) else {}
            doc_id = meta.get("document_id")

            if allowed_ids and doc_id not in allowed_ids:
                continue

            # Convert L2 distance to confidence percentage (closer to 0 -> higher match)
            confidence = max(10, min(99.8, round(100.0 / (1.0 + float(dist)), 1)))
            page = meta.get("page", 1)

            results.append({
                "chunk": self.chunks[idx],
                "document_id": doc_id,
                "page": page,
                "confidence": confidence,
                "score": float(dist),
                "rank": len(results) + 1,
            })

            if len(results) >= k:
                break

        return results

    # ----------------------------------------
    # Document Context (Single or Multiple)
    # ----------------------------------------

    def get_document_context(self, document_id: str | list[str] | None = None) -> str:
        if document_id is None:
            return "\n\n".join(self.chunks)

        allowed_ids = set()
        if isinstance(document_id, list):
            allowed_ids = {str(d) for d in document_id if d}
        elif document_id:
            allowed_ids = {str(document_id)}

        data = [
            chunk for chunk, meta in zip(self.chunks, self.metadata)
            if not allowed_ids or meta.get("document_id") in allowed_ids
        ]

        logger.info(
            f"Retrieved {len(data)} chunks of context for allowed_ids='{allowed_ids}' (Total chars: {sum(len(c) for c in data)})"
        )
        return "\n\n".join(data)

    # ----------------------------------------
    # Total Chunks
    # ----------------------------------------

    def total_documents(self) -> int:
        return len(self.chunks)

    # ----------------------------------------
    # Clear
    # ----------------------------------------

    def clear(self):
        logger.info("Clearing vector database...")
        self._create_new_index()
        self.save()
        logger.info("Vector database cleared successfully")