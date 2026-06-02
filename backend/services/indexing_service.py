from parsers.file_walker import walk_repository
from chunking.chunker_factory import get_chunker
from embeddings.embedder import Embedder
from retrieval.faiss_store import FAISSStore
from pathlib import Path
from config import settings
from core.ai import embedder

# embedder = Embedder()
faiss_store = FAISSStore()

def index_repository(repo_id: str, clone_path: str):
    repository_files = walk_repository(clone_path)
    all_chunks = []

    for file_dict in repository_files:
        language = file_dict["language"]

        chunker = get_chunker(language)

        chunks = chunker.chunk(file_dict)

        all_chunks.extend(chunks)

    # Get the embedded_chunks
    embedded_chunks = embedder.embed_chunks(all_chunks)

    # Build FAISS index
    faiss_store.build_index(embedded_chunks)

    # Save FAISS index
    faiss_store.save(repo_id)

    vector_store_path = str(
        Path(settings.VECTOR_STORE_DIR) / repo_id
    )


    return {
        "repo_id": repo_id,
        "total_files": len(repository_files),
        "total_chunks": len(all_chunks),
        "vector_store_path": vector_store_path,
        "status": "Indexed Successfully"
    }