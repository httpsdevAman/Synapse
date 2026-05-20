import numpy as np
import faiss
from pathlib import Path
from config import settings
import pickle

class FAISSStore:
    def __init__(self):
        self.index = None
        self.chunk_metadata = []

    def build_index(self, chunks: list):        # Inputs embedded chunks
        if not chunks:
            raise ValueError("No chunks provided")
        
        embeddings = np.array(
            [chunk["embedding"] for chunk in chunks],
            dtype=np.float32
        )

        # Normalize for cosine similarity
        faiss.normalize_L2(embeddings)

        embedding_dim = embeddings.shape[1]

        # Create faiss index
        self.index = faiss.IndexFlatIP(embedding_dim)

        # Add vectors
        self.index.add(embeddings)

        # Store metadata without embeddings
        self.chunk_metadata = []

        for chunk in chunks:
            metadata = {key: value for key, value in chunk.items() if key != "embedding"}
            self.chunk_metadata.append(metadata)

    def search(self, query_embedding, top_k: int = 5):
        if self.index is None:
            raise ValueError("FAISS Index is not initialized")
        
        query_vector = np.array(
            [query_embedding],
            dtype=np.float32
        )

        faiss.normalize_L2(query_vector)

        scores, indices = self.index.search(query_vector, top_k)

        results = []

        for score, idx in zip(scores[0], indices[0]):
            if(idx == -1):
                continue

            results.append({
                "score": float(score),
                "chunk": self.chunk_metadata[idx]
            })

        return results
    
    def save(self, repo_id: str):
        if self.index is None:
            raise ValueError("No index to save")
        
        save_path = Path(settings.VECTOR_STORE_DIR) / repo_id

        save_path.mkdir(parents=True, exist_ok=True)

        # Save FAISS index
        faiss.write_index(
            self.index,
            str(save_path / "index.faiss")
        )

        # Save metadata
        with open(save_path / "metadata.pkl", "wb") as f:
            pickle.dump(self.chunk_metadata, f)
    
    def load(self, repo_id: str):
        load_path = Path(settings.VECTOR_STORE_DIR) / repo_id

        # Load FAISS index
        self.index = faiss.read_index(
            str(load_path / "index.faiss")
        )

        # Load metadata
        with open(load_path / "metadata.pkl", "rb") as f:
            self.chunk_metadata = pickle.load(f)