from app.services.embedding_service import EmbeddingService
from app.services.vector_store import VectorStore

embedding_service = EmbeddingService()
vector_store = VectorStore()

chunks = [
    "Artificial Intelligence is a branch of Computer Science.",
    "Machine Learning is part of Artificial Intelligence.",
    "Python is widely used for AI."
]

embeddings = embedding_service.create_embeddings(chunks)

vector_store.add_documents(chunks, embeddings)

query_embedding = embedding_service.create_query_embedding(
    "What is AI?"
)

results = vector_store.search(query_embedding)

print("Search Results:\n")

for item in results:
    print(item)