from sentence_transformers import SentenceTransformer
import numpy as np


class EmbeddingService:

    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def create_embeddings(self, texts):
        embeddings = self.model.encode(
            texts,
            convert_to_numpy=True
        )
        return embeddings.astype(np.float32)

    def create_query_embedding(self, query):
        embedding = self.model.encode(
            query,
            convert_to_numpy=True
        )
        return embedding.astype(np.float32)