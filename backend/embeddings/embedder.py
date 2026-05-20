from config import settings
from sentence_transformers import SentenceTransformer

class Embedder:
    def __init__(self):
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL)

    def embed_chunks(self, chunks: list):
        if not chunks:
            return []
        
        # Text content 
        texts = [chunk["content"] for chunk in chunks]

        # Generate embeddings in batch
        embeddings = self.model.encode(
            texts, show_progress_bar=True
        )

        embedded_chunks = []

        for chunk, embedding in zip(chunks, embeddings):
            chunk["embedding"] = embedding.tolist()
            embedded_chunks.append(chunk)

        return embedded_chunks
    
    def embed_text(self, text: str):
        embedding = self.model.encode(text)
        return embedding.tolist()